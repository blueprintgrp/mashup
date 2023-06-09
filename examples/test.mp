fun makeAdder (offset) {
    fun add (x, y) {
        x + y + offset
    }

    add
}

const adder = makeAdder(1)

println(adder(10, 5))