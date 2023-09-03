@trenskow/parse
----

A small library for parsing a string into a tree.

# Usage

Below is an example on how to use the library.

````javascript
import parse from '@trenskow/parse';

parse('${', '}', { /* options */ }).do('This ${is ${my ${nested ${string}}}}');
````

The above example will return the following structure

````javascript
[
    'This ', [
        'is ', [
            'my ', [
                'nested ',
                'string'
            ]
        ]
    ]
]
````

> One caveat: opening and closing token cannot be the same.

## Options

The following options are available.

| Name           | Description                                                  | Type                      | Default value |
| -------------- | ------------------------------------------------------------ | ------------------------- | ------------- |
| `maxDepth`     | Do not parse under a certain depth.                          | Number                    | `Infinity`    |
| `ignoreInside` | A string (or array of strings) indicating characters at which to ignore parsing in between (see example [below](#ignoreInside)). | String or Array of String | `[]`          |

### `ignoreInside`

An example of ignore inside is this.

````javascript
parse('[', ']', { ignoreInside: '"' }).do('This is ["my custom [string]"]')
// ➡ [ 'This is ', '"my custom [string]"' ]
````

# License

See license in LICENSE.

