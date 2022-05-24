@trenskow/parse
----

A small library for parsing a string into a tree.

# Usage

Below is an example on how to use the library.

````javascript
import parse from '@trenskow/parse';

parse('${', '}', {
    ignoreInside: ['"', '\'']
}).do('This ${\'is\' ${my ${"nested" ${string}}}}');
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

> One caveat: opening and closing token cannot be the same.

# License

See license in LICENSE.

