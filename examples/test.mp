let foo = 50 / 2

const object = {
    x: 100,
    y: 32,
    foo: foo,
    complex: {
        bar: true
    },
}

let f = object.complex.bar
foo = object.foo() + 5