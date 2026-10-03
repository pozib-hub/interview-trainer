# Test Cases

Test Cases

    const tuple = [1] as const
    type cases = [
        Expect<Equal<Concat<[], [], []>>,
        Expect Equal<Concat<[], [1]>, [1]>>,
        Expect<Equal<Concat<typeof tuple, typeof tuple>, [1, 1]>>,
        Expect<Equal<Concat<[1, 2], [3, 4], [1, 2, 3, 4]>>,
        Expect<Equal<Concat<['1', 2, '3'], [false, boolean, '4'], ['1', 2, '3', false, boolean, '4']>>
    ]
