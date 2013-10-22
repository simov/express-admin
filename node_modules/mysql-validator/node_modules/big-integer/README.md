BigInteger.js
=========

**BigInteger.js** is an arbitrary-length integer library for Javascript, allowing arithmetic operations on integers of unlimited size, notwithstanding memory and time limitations.

If you are using a browser, you can download [BigInteger.js from GitHub](http://peterolson.github.com/BigInteger.js/BigInteger.min.js) or just hotlink to it:

	<script src="http://peterolson.github.com/BigInteger.js/BigInteger.min.js"></script>

If you are using node, you can install BigInteger with [npm](https://npmjs.org/).

    npm install big-integer

Then you can include it in your code:

	var bigInt = require("big-integer");

`bigInt(number)`
---
You can create a bigInt by calling the `bigInt` function. You can pass in

 - a string, which it will parse as an bigInt and throw an `"Invalid integer"` error if the parsing fails.
 - a Javascript number, which it will parse as an bigInt and throw an `"Invalid integer"` error if the parsing fails.
 - another bigInt.
 - nothing, and it will return `bigInt.zero`.

Examples:

    var zero = bigInt();
    var ninetyThree = bigInt(93);
	var largeNumber = bigInt("75643564363473453456342378564387956906736546456235345");
	var googol = bigInt("1e100");
	var bigNumber = bigInt(largeNumber);

Note that Javascript numbers larger than `9007199254740992` and smaller than `-9007199254740992` are not precisely represented numbers and will not produce exact results. If you are dealing with numbers outside that range, it is better to pass in strings.

Method Chaining
---
Note that bigInt operations return bigInts, which allows you to chain methods, for example:

    var salary = bigInt(dollarsPerHour).times(hoursWorked).plus(randomBonuses)

Constants
---

There are three constants already stored that you do not have to construct with the `bigInt` function yourself:

 - `bigInt.one`, equivalent to `bigInt(1)`
 - `bigInt.zero`, equivalent to `bigInt(0)`
 - `bigInt.minusOne`, equivalent to `bigInt(-1)`

Methods
===

`abs()`
---
Returns the absolute value of a bigInt.

 - `bigInt(-45).abs()` => `45`
 - `bigInt(45).abs()` => `45`

`add(number)`
---
Performs addition.

 - `bigInt(5).add(7)` => `12`

`compare(number)`
---
Performs a comparison between two numbers. If the numbers are equal, it returns `0`. If the first number is greater, it returns `1`. If the first number is lesser, it returns `-1`.

 - `bigInt(5).compare(5)` => `0`
 - `bigInt(5).compare(4)` => `1`
 - `bigInt(4).compare(5)` => `-1`

`compareAbs(number)`
---
Performs a comparison between the absolute value of two numbers.

 - `bigInt(5).compareAbs(-5)` => `0`
 - `bigInt(5).compareAbs(4)` => `1`
 - `bigInt(4).compareAbs(-5)` => `-1`

`divide(number)`
---
Performs integer division, disregarding the remainder.

 - `bigInt(59).divide(5)` => `11`

`divmod(number)`
---
Performs division and returns an object with two properties: `quotient` and `remainder`. The sign of the remainder will match the sign of the dividend.

 - `bigInt(59).divmod(5)` => `{quotient: bigInt(11), remainder: bigInt(4) }`
 - `bigInt(-5).divmod(2)` => `{quotient: bigInt(-2), remainder: bigInt(-1) }`

`equals(number)`
---
Checks if two numbers are equal.

 - `bigInt(5).equals(5)` => `true`
 - `bigInt(4).equals(7)` => `false`

`greater(number)`
---
Checks if the first number is greater than the second.

 - `bigInt(5).greater(6)` => `false`
 - `bigInt(5).greater(5)` => `false`
 - `bigInt(5).greater(4)` => `true`

`greaterOrEquals(number)`
---
Checks if the first number is greater than or equal to the second.

 - `bigInt(5).greaterOrEquals(6)` => `false`
 - `bigInt(5).greaterOrEquals(5)` => `true`
 - `bigInt(5).greaterOrEquals(4)` => `true`

`isEven(number)`
---
Returns `true` if the number is even, `false` otherwise.

 - `bigInt(6).isEven()` => `true`
 - `bigInt(3).isEven()` => `false`

`isNegative(number)`
---
Returns `true` if the number is negative, `false` otherwise.
Returns `false` for `0` and `true` for `-0`.

 - `bigInt(-23).isNegative()` => `true`
 - `bigInt(50).isNegative()` => `false`

`isOdd(number)`
---
Returns `true` if the number is odd, `false` otherwise.

 - `bigInt(13).isOdd()` => `true`
 - `bigInt(40).isOdd()` => `false`

`isPositive(number)`
---
Return `true` if the number is positive, `false` otherwise.
Returns `true` for `0` and `false` for `-0`.

 - `bigInt(54).isPositive()` => `true`
 - `bigInt(-1).isPositive()` => `false`

`lesser(number)`
---
Checks if the first number is lesser than the second.

 - `bigInt(5).lesser(6)` => `true`
 - `bigInt(5).lesser(5)` => `false`
 - `bigInt(5).lesser(4)` => `false`

`lesserOrEquals(number)`
---
Checks if the first number is less than or equal to the second.

 - `bigInt(5).lesserOrEquals(6)` => `true`
 - `bigInt(5).lesserOrEquals(5)` => `true`
 - `bigInt(5).lesserOrEquals(4)` => `false`

`minus(number)`
---
Alias for the `subtract` method.

 - `bigInt(3).minus(5)` => `-2`

`mod(number)`
---
Performs division and returns the remainder, disregarding the quotient. The sign of the remainder will match the sign of the dividend.

 - `bigInt(59).mod(5)` =>  `4`
 - `bigInt(-5).mod(2)` => `-1`

`multiply(number)`
---
Performs multiplication.

 - `bigInt(111).multiply(111)` => `12321`

`next()`
---
Adds one to the number.

 - `bigInt(6).next()` => `7`

`notEquals(number)`
---
Checks if two numbers are not equal.

 - `bigInt(5).notEquals(5)` => `false`
 - `bigInt(4).notEquals(7)` => `true`

 - `bigInt(6).next()` => `7`

`over(number)`
---
Alias for the `divide` method.

 - `bigInt(59).over(5)` => `11`

`plus(number)`
---
Alias for the `add` method.

 - `bigInt(5).plus(7)` => `12`

`pow(number)`
---
Performs exponentiation. If the exponent is less than `0`, `pow` returns `0`. `bigInt.zero.pow(0)` returns `1`.

 - `bigInt(16).pow(16)` => `18446744073709551616`

`prev(number)`
---
Subtracts one from the number.

 - `bigInt(6).prev()` => `5`

`subtract(number)`
---
Performs subtraction.

 - `bigInt(3).subtract(5)` => `-2`

`times(number)`
---
Alias for the `multiply` method.

 - `bigInt(111).times(111)` => `12321`

`toJSNumber()`
---
Converts a bigInt into a native Javascript number. Loses precision for numbers outside the range `[-9007199254740992, 9007199254740992]`.

 - `bigInt("18446744073709551616").toJSNumber()` => `18446744073709552000`

Override Methods
===

`toString()`
---
Converts a bigInt to a string.

`valueOf()`
---
Converts a bigInt to a native Javascript number. This override allows you to use native arithmetic operators without explicit conversion:

    bigInt("100") + bigInt("200") === 300; //true