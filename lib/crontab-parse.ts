type Expression = {
  start: number
  end: number
}

type AnyValueExpression = { type: "AnyValue" } & Expression
type NumberValueExpression = { type: "NumberValue", value: number } & Expression
type ListItemExpression = { type: "ListItemValue", value: string } & Expression
type ListValueExpression = { type: "ListValue", values: MathExpression[] } & Expression
type StepValueExpression = { type: "StepValue", left: MathExpression, right: MathExpression } & Expression
type RangeValueExpression = { type: "RangeValue", left: MathExpression, right: MathExpression } & Expression

type MathExpression = AnyValueExpression | NumberValueExpression | ListValueExpression | StepValueExpression | RangeValueExpression

type StatementExpression = {
  type: "Statement"
  body: MathExpression[]
} & Expression

type ExpressionPart = Expression & {
  body: string
}

function* eachExpressionPart(body: string): Generator<ExpressionPart> {
  const exp = /\s+/g
  let res: null | RegExpExecArray = null

  let nextStart = 0
  while ((res = exp.exec(body)) !== null) {
    yield {
      start: nextStart,
      end: res.index,
      body: body.substring(nextStart, res.index)
    }
    nextStart = res.index + res[0].length
  }
  yield {
    start: nextStart,
    end: body.length,
    body: body.substring(nextStart, body.length)
  }
}

type TestExpressionPart = (expressionPart: ExpressionPart) => MathExpression | null

const AnyValueExpressionPartParse: TestExpressionPart = (expressionPart: ExpressionPart): MathExpression | null => expressionPart.body === '*' ? { type: 'AnyValue', start: expressionPart.start, end: expressionPart.end } : null

const toNumber = (value: unknown, enumList?: (string | null)[]): null | number => {
  if (typeof value !== 'string') return null
  if (/^\d+$/.test(value)) return Number(value)
  if (enumList) {
    let n = -1
    for (const match of enumList) {
      n += 1
      if (match?.toLowerCase() === value.toLowerCase()) {
        return n
      }
    }
  }
  return null
}

const NumberValueExpressionPartParse = (start?: number, end?: number, enumList?: (null | string)[]): TestExpressionPart => (expressionPart: ExpressionPart): MathExpression | null => {
  const num = toNumber(expressionPart.body, enumList)
  if (num === null) return null;
  if (start !== undefined && num < start) return null
  if (end !== undefined && num > end) return null
  return { type: 'NumberValue', start: expressionPart.start, end: expressionPart.end, value: num };
}

const RangeValueExpressionPartParse = (leftTestExpressionPart: TestExpressionPart, rightTestExpressionPart: TestExpressionPart): TestExpressionPart => (expressionPart) => {
  const expr = /^(.+)\-(.+)$/
  const regExpExecArray = expr.exec(expressionPart.body)
  if (!regExpExecArray) return null
  const [, leftRaw, rightRaw] = regExpExecArray
  const leftExpressionPart: ExpressionPart = {
    body: leftRaw,
    start: expressionPart.start,
    end: expressionPart.start + leftRaw.length
  }
  const rightExpressionPart: ExpressionPart = {
    body: rightRaw,
    start: expressionPart.start + leftRaw.length + 1,
    end: expressionPart.start + leftRaw.length + 1 + rightRaw.length
  }
  const left = leftTestExpressionPart(leftExpressionPart)
  const right = rightTestExpressionPart(rightExpressionPart)

  if (!left) throw new Error('Unexpected token', { cause: leftExpressionPart })
  if (!right) throw new Error('Unexpected token', { cause: rightExpressionPart })

  return {
    type: 'RangeValue',
    start: right!.start,
    end: left!.end,
    left,
    right,
  }
}

const StepValueExpressionPartParse = (leftTestExpressionPart: TestExpressionPart, rightTestExpressionPart: TestExpressionPart): TestExpressionPart => (expressionPart) => {
  const expr = /^(.+)\/(.+)$/

  const regExpExecArray = expr.exec(expressionPart.body)

  if (regExpExecArray === null) return null

  const leftExpressionPart: ExpressionPart = {
    start: expressionPart.start,
    end: expressionPart.start + regExpExecArray[1].length,
    body: regExpExecArray[1],
  }
  const rightExpressionPart: ExpressionPart = {
    start: expressionPart.start + regExpExecArray[1].length + 1,
    end: expressionPart.start + regExpExecArray[1].length + 1 + regExpExecArray[2].length,
    body: regExpExecArray[2],
  }

  const left = leftTestExpressionPart(leftExpressionPart)
  const right = rightTestExpressionPart(rightExpressionPart)
  if (!right) throw new Error(`Unexpected token`, { cause: rightExpressionPart })
  if (!left) throw new Error(`Unexpected token`, { cause: leftExpressionPart })

  return {
    type: "StepValue",
    left,
    right,
    start: left.start,
    end: right.end,
  }
}

function* splitTokens(body: string): Generator<ListItemExpression> {
  const spl = /,/g

  let res: null | RegExpExecArray = null
  let start = 0
  let end = 0
  while ((res = spl.exec(body)) !== null) {
    yield {
      type: "ListItemValue",
      start,
      end,
      value: body.substring(start, res.index)
    }
    start = res.index + 1
  }

  yield {
    type: "ListItemValue",
    start,
    end: body.length,
    value: body.substring(start, body.length)
  }

}

const ListValuesExpressionPartParse = (allowTests: TestExpressionPart[]): TestExpressionPart => (expressionPart) => {
  if (!/,/.test(expressionPart.body)) return null
  return {
    type: 'ListValue',
    start: expressionPart.start,
    end: expressionPart.end,
    values: Array.from(
      splitTokens(expressionPart.body),
      item => matrixExpressionPart(allowTests)({
        start: expressionPart.start + item.start,
        end: expressionPart.start + item.end,
        body: item.value
      })
    )
  }
}

const matrixExpressionPart = (tests: TestExpressionPart[]) => (expressionPart: ExpressionPart): MathExpression => {
  for (const test of tests) {
    const res = test(expressionPart)
    if (res) return res
  }
  throw new Error(`Unexpected token`, { cause: expressionPart })
}

namespace minuteExpressionPartParse {
  export const number = NumberValueExpressionPartParse(0, 59)
  export const any = AnyValueExpressionPartParse
  export const range = RangeValueExpressionPartParse(number, number)
  export const step = StepValueExpressionPartParse(
    matrixExpressionPart([
      number,
      range,
    ]),
    number
  )
  export const list = ListValuesExpressionPartParse([
    step,
    range,
    number,
  ])

  export const all = matrixExpressionPart([
    list,
    step,
    range,
    any,
    number,
  ])
}

namespace hourExpressionPartParse {
  export const number = NumberValueExpressionPartParse(0, 23)
  export const any = AnyValueExpressionPartParse
  export const range = RangeValueExpressionPartParse(number, number)
  export const step = StepValueExpressionPartParse(
    matrixExpressionPart([
      number,
      range,
    ]),
    number
  )
  export const list = ListValuesExpressionPartParse([
    step,
    range,
    number,
  ])

  export const all = matrixExpressionPart([
    list,
    step,
    range,
    any,
    number,
  ])
}

namespace dayOfMonthExpressionPartParse {
  export const number = NumberValueExpressionPartParse(1, 31)
  export const any = AnyValueExpressionPartParse
  export const range = RangeValueExpressionPartParse(number, number)
  export const step = StepValueExpressionPartParse(
    matrixExpressionPart([
      number,
      range,
    ]),
    number
  )
  export const list = ListValuesExpressionPartParse([
    step,
    range,
    number,
  ])

  export const all = matrixExpressionPart([
    list,
    step,
    range,
    any,
    number,
  ])
}
namespace monthExpressionPartParse {
  export const number = NumberValueExpressionPartParse(1, 12, [null, 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
  export const any = AnyValueExpressionPartParse
  export const range = RangeValueExpressionPartParse(number, number)
  export const step = StepValueExpressionPartParse(
    matrixExpressionPart([
      number,
      range,
    ]),
    number
  )
  export const list = ListValuesExpressionPartParse([
    step,
    range,
    number,
  ])

  export const all = matrixExpressionPart([
    list,
    step,
    range,
    any,
    number,
  ])
}
namespace dayWeekExpressionPartParse {
  export const number = NumberValueExpressionPartParse(0, 6, ['mon', 'tue', 'wed', 'thu', 'fri', 'sat', 'sun'])
  export const any = AnyValueExpressionPartParse
  export const range = RangeValueExpressionPartParse(number, number)
  export const step = StepValueExpressionPartParse(
    matrixExpressionPart([
      number,
      range,
    ]),
    number
  )
  export const list = ListValuesExpressionPartParse([
    step,
    range,
    number,
  ])

  export const all = matrixExpressionPart([
    list,
    step,
    range,
    any,
    number,
  ])
}

const parseMinuteExpressionPart = (expressionPart: ExpressionPart): MathExpression => minuteExpressionPartParse.all(expressionPart)
const parseHourExpressionPart = (expressionPart: ExpressionPart): MathExpression => hourExpressionPartParse.all(expressionPart)
const parseDayMonthExpressionPart = (expressionPart: ExpressionPart): MathExpression => dayOfMonthExpressionPartParse.all(expressionPart)
const parseMonthExpressionPart = (expressionPart: ExpressionPart): MathExpression => monthExpressionPartParse.all(expressionPart)
const parseDayWeekExpressionPart = (expressionPart: ExpressionPart): MathExpression => dayWeekExpressionPartParse.all(expressionPart)

const parseExpressionPart = (expressionPart: ExpressionPart, index: number): MathExpression => {
  const parser = [parseMinuteExpressionPart, parseHourExpressionPart, parseDayMonthExpressionPart, parseMonthExpressionPart, parseDayWeekExpressionPart].at(index)
  if (!parser) throw new Error(`Unexpected token`, { cause: expressionPart })
  return parser(expressionPart)
}

export const astCrontabParse = (body: string): StatementExpression => {
  const parts = Array.from(eachExpressionPart(body), parseExpressionPart)

  return {
    type: "Statement",
    start: 0,
    end: body.length,
    body: parts
  }
}
