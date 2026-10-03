# Есть объект X (произвольный) и функция getProperty,

Есть объект X (произвольный) и функция getProperty, 
    которая на вход принимает произвольный объект и строковое значение свойства этого объекта
    Необходимо при помощи TypeScript допилить функци getProperty таким образом, 
    что бы на этапе написания кода в строке
    getProperty(X, 'm') компилятор выдавал ошибку "Argument of type '"m"' is not assignable to parameter of type '"a"' | "b" | "c" | "d"
    
    const X = { a: 1, b: 2, c: 3, d: 4 };

    function getProperty(obj, key) {
        return obj[key];
    }
