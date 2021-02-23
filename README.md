# cbapi.js

**cbapi.js** позволяет работать с API «Клиентской базы».

Если вы ищете серверное решение на PHP, то обратите внимание на [CBAPIClerk](https://github.com/infernusophiuchus/cbapiclerk "CBAPIClerk").

[![Версия](https://img.shields.io/badge/%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F-1.0.0-yellow "Версия")](https://img.shields.io/badge/%D0%B2%D0%B5%D1%80%D1%81%D0%B8%D1%8F-1.0.0-yellow "Версия")

## Установка

1. Скачайте последний релиз пакета и распакуйте в папку вашего проекта.

2. В консоли, будучи в папке проекта, выполните команду `npm install` или `yarn install`, в зависимости от того, как менеджером пакетов вы привыкли пользоваться.

3. Подключите файл _cbapi.js_ к вашему проекту.

## Как пользоваться

Нужно создать объект на основе класса CBAPI:

```javascript
var cbapi = new CBAPI(
    'http://your-site.ru', // адрес вашей «Клиентской базы»
    'login', // логин пользователя с включенным доступом по API
    'apikey' // ключ, сгенерированный системой
)
```

Работа методов класса базируется на обращении к методу **CBAPI.command()**, который, в свою очередь, работает на основе функции **fetch()**. Соответственно, вся работа с методами класса должна строиться в асинхронном стиле, как с промисами.

Пример:

```javascript
const auth = async () => {return await window.cbapi.userList()}
auth().then((answer) => {console.log(answer)})
```

Данный пример должен вывести в консоль ответ от «Клиентской базы» с информацией обо всех пользователях.

## API-маршруты и методы

_/api/data/create_ — **dataCrud**('create', command), **dataCreate**(command)

_/api/data/read_ — **dataCrud**('read', command), **dataRead**(command)

_/api/data/update_ — **dataCrud**('update', command), **dataUpdate**(command)

_/api/data/delete_ — **dataCrud**('delete', command), **dataUpdate**(command)

_/api/group/get_list_ — **getList**('group'), **groupList**()

_/api/table/get_list_ — **getList**('table'), **tableList**()

_/api/table/get_perms_ — **tableDetails**('perms', id), **tablePerms**(id)

_/api/table/info_ — **tableDetails**('info', id), **tableInfo**(id)

_/api/user/get_list_ — **getList**('user'), **userList**(),

_/api/data/files_ — **files**(command)

P.S.:

command — объект с параметрами запроса (см. https://clientbase.ru/help/for_admin_16/api/)

id — ID сущности в системе, тип **int**
