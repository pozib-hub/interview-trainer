# import {} from "react";

import {} from "react";
  import Api from "./internal/api";

  // реализовать добавление / удаление / отправку элементов
  // отрисовку ошибок у каждого инпута и общие внизу всего списка
  // ( ошибки получаем после отправки формы, в response )
  // также по желанию можно отобразить loading / success

  export default function App() {
    return (
      <div>
        <button>Добавить</button>
        <div>
          1 <input />
        </div>
        <div>
          2 <input />
        </div>
        <div>
          3 <input />
        </div>
        <button>Отправить</button>
        {/ <button>Отправка...</button> /}
        {/ <div>Успешно отправлено</div> /}
      </div>
    );
  }
