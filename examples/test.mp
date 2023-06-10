fun info(message) {
    const prefix = "Info: "
    println(prefix + message)
}

fun error(message) {
    const prefix = "Error: "
    println(prefix + message)
}

fun warn(message) {
    const prefix = "Warn: "
    println(prefix + message)
}

const logger = {
    info,
    error,
    warn,
}

logger.error("Something wrong happend")
println(15 == 17)