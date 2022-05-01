@trenskow/parse
----

A small library for parsing a string into a tree.

# Usage

Below is an example on how to use the library.

````javascript
import parse from '@trenskow/parse';

parse('${', '}').do('This ${is ${my ${nested ${string}}}}');
````

The above example will return the following structure

````JSON
[
    "This ",
    [
        "is ",
        [
            "my ",
            [
                "nested ",
                "string"
            ]
        ]
    ]
]
````

# License

See license in LICENSE.

