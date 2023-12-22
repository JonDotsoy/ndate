import {
  assertArrayIncludes,
  assertEquals,
  assertInstanceOf,
  assertObjectMatch,
} from "https://deno.land/std@0.204.0/assert/mod.ts";
import { astCrontabParse } from "./crontab-parse.ts";

Deno.test("Parse AST", () => {
  assertEquals(
    astCrontabParse("* * * * *"),
    {
      type: "Statement",
      start: 0,
      end: 9,
      body: [
        {
          type: 'AnyValue',
          start: 0,
          end: 1,
        },
        {
          end: 3,
          start: 2,
          type: "AnyValue",
        },
        {
          end: 5,
          start: 4,
          type: "AnyValue",
        },
        {
          end: 7,
          start: 6,
          type: "AnyValue",
        },
        {
          end: 9,
          start: 8,
          type: "AnyValue",
        },
      ]
    }
  )
})

Deno.test("Parse AST", () => {
  assertEquals(
    astCrontabParse("1 * * * *").body.at(0),
    {
      type: 'NumberValue',
      start: 0,
      end: 1,
      value: 1
    }
  );
  assertObjectMatch(
    astCrontabParse("1,2,3,4 * * * *"),
    {
      body: [{
        values: [
          { type: 'NumberValue', value: 1 },
          { type: 'NumberValue', value: 2 },
          { type: 'NumberValue', value: 3 },
          { type: 'NumberValue', value: 4 },
        ]
      }]
    }
  );
  assertObjectMatch(
    astCrontabParse("1,2,3,4 * * * *"),
    {
      body: [{
        values: [
          { type: 'NumberValue', value: 1 },
          { type: 'NumberValue', value: 2 },
          { type: 'NumberValue', value: 3 },
          { type: 'NumberValue', value: 4 },
        ]
      }]
    }
  );
  assertObjectMatch(
    astCrontabParse("1,2,3,4 * * * *"),
    {
      body: [{
        type: 'ListValue',
        values: [
          { type: 'NumberValue', value: 1 },
          { type: 'NumberValue', value: 2 },
          { type: 'NumberValue', value: 3 },
          { type: 'NumberValue', value: 4 },
        ]
      }]
    }
  );
  assertObjectMatch(
    astCrontabParse("1 * * * *"),
    {
      body: [{
        type: 'NumberValue',
        value: 1
      }]
    }
  );
  assertObjectMatch(
    astCrontabParse("1/2 * * * *"),
    {
      body: [{
        type: 'StepValue',
        left: { type: "NumberValue", value: 1 },
        right: { type: "NumberValue", value: 2 },
      }]
    }
  );
  assertObjectMatch(
    astCrontabParse("1-2 * * * *"),
    {
      body: [{
        type: 'RangeValue',
        left: {
          type: 'NumberValue',
          value: 1
        },
        right: {
          type: 'NumberValue',
          value: 2
        }
      }]
    }
  );
  assertObjectMatch(
    astCrontabParse("1-2/3 * * * *"),
    {
      body: [{
        type: 'StepValue',
        left: {
          type: 'RangeValue',
          left: {
            type: 'NumberValue',
            value: 1
          },
          right: {
            type: 'NumberValue',
            value: 2
          }
        },
        right: {
          type: 'NumberValue',
          value: 3
        }
      }]
    }
  );
  assertObjectMatch(
    astCrontabParse("4,1-2/3 * * * *"),
    {
      body: [{
        type: "ListValue",
        values: [
          {
            type: "NumberValue",
            value: 4
          },
          {
            type: 'StepValue',
            left: {
              type: 'RangeValue',
              left: {
                type: 'NumberValue',
                value: 1
              },
              right: {
                type: 'NumberValue',
                value: 2
              }
            },
            right: {
              type: 'NumberValue',
              value: 3
            }
          }
        ]
      }]
    }
  );
  assertObjectMatch(
    astCrontabParse("* * * jan *"),
    { body: [{}, {}, {}, { value: 1 }] },
  );
})
