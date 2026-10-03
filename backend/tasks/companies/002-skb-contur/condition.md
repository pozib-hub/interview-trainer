# СКБ Контур

Компания - СКБ Контур

    // 1.
    // С помощью средств языка опишите недостающие типы

    type ApiRequest<T> = {}; // todo
    function request<T>(args: ApiRequest<T>) {}

    // valid
    request({ method: "GET", data: "foo" });
    request({ method: "POST", data: 1 });

    // should be error
    request({ method: "GET", data: 1 });
    // should be error
    request({ method: "POST", data: "foo" });

    // 2.
    // С помощью средств языка опишите недостающие типы

    const moviesRating = { titanic: 8, avatar: 8, inception: 9, batman: 7 };

    type MoviesRating = any; // todo
    type Movies = any; // todo

    // valid
    let example: Partial<MoviesRating> = { titanic: 8 };
    // should be error
    example = { terminator: 8 };

    // valid
    let movie: Movies = "avatar";
    // should be error
    movie = "superman";
