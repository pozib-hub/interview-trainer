# Реализовать функцию имеющую следующий интерфейс и семантику работы:

Реализовать функцию имеющую следующий интерфейс и семантику работы:

    function sum(a, b, c) {
        return a + b + c
    }

    function x2(a, b) {
        return a + b
    }

    function curry(fn)  {
        TODO
    }

    curry(sum)(1, 2, 3) => 6
    curry(sum)(1, 2)(3) => 6
    curry(sum)(1)(2)(3) => 6
