/**
 * CBAPI.js 0.9.9
 * Copyright (c) 2021 Dmitry Shumilin
 * 
 * MIT License
 * 
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 * 
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 * 
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
'use strict'

class CBAPI
{
    url
    login
    key

    constructor(url, login, key)
    {
        this.url = String(url)
        this.login = String(login)
        this.key = String(key)

        if (this.url[this.url.length - 1] != '/') this.url = this.url+'/'

        let http = ''

        for (let i = 0; i < 4; i++)
        {
            http = http+this.url[i]
        }

        if (http != 'http')
        {
            switch (this.url[0]+this.url[1])
            {
                case ':/':
                    this.url = 'http'+this.url
                    break

                case '//':
                    this.url = 'http:'+this.url
                    break

                default:
                    this.url = 'http://'+this.url
                    break
            }
        }
    }

    async command(url, command)
    {
        command = JSON.stringify(command)

        const request = await fetch(url, {
            method: 'POST',
            mode: 'cors',
            body: command
        })

        return await request.json()
    }

    async auth()
    {
        const request = await this.command(
            this.url+'api/auth/request',
            {
                v: '1.0',
                login: this.login,
                life_time: 60
            }
        )

        let response = await request

        if (response['code'] == 0)
        {
            const auth = await this.command(
                this.url+'api/auth/auth',
                {
                    v: '1.0',
                    login: this.login,
                    hash: md5(response['salt']+this.key)
                }
            )

            response = await auth

            if (response['code'] == 0) return response['access_id']
            else
            {
                response['text'] = 'Authentication failure.'

                this.error(response)
                return ''
            }
        }
        else
        {
            response['text'] = 'Authentication salt request failure.'

            this.error(response)
            return ''
        }
    }

    async dataCrud(action, command)
    {
        if (action == 'create' ||
            action == 'read' ||
            action == 'update' ||
            action == 'delete')
        {
            command['access_id'] = await this.auth()

            const request = await this.command(
                this.url+'api/data/'+action,
                command
            )

            return await request
        }
        else
        {
            const error = {
                text: 'CBAPI error',
                code: -7,
                message: 'Invalid action.'
            }

            error(error)

            return error
        }
    }

    async dataCreate(command) {return await this.dataCrud('create', command)}
    async dataRead(command) {return await this.dataCrud('read', command)}
    async dataUpdate(command) {return await this.dataCrud('update', command)}
    async dataDelete(command) {return await this.dataCrud('delete', command)}

    async getList(entity)
    {
        if (entity == 'group' ||
            entity == 'table' ||
            entity == 'user')
        {
            return await this.command(
                this.url+'api/'+entity+'/get_list',
                {access_id: await this.auth()}
            )
        }
        else
        {
            const error = {
                text: 'CBAPI error',
                code: -8,
                message: 'This entity cannot be listed.'
            }

            this.error(error)

            return error
        }
    }

    async groupList() {return await this.getList('group')}
    async tableList() {return await this.getList('table')}
    async userList() {return await this.getList('user')}

    async tableDetails(detail, id)
    {
        let request_uri = '/api/table/'

        if (detail == 'perms' ||
            detail == 'info')
        {
            request_uri = request_uri +
            (detail == 'perms' ? 'get_'+detail : detail)

            return await this.command(
                this.url+request_uri,
                {
                    access_id: await this.auth(),
                    id: id
                }
            )
        }
        else
        {
            const error = {
                text: 'CBAPI error',
                code: -9,
                message: 'Invalid table details requested.'
            }

            this.error(error)

            return error
        }
    }

    async tablePerms(id) {return await this.tableDetails('perms', id)}
    async tableInfo(id) {return await this.tableDetails('info', id)}

    async files(command)
    {
        command['access_id'] = await this.auth()

        return await this.command(
            this.url+'api/data/files',
            command
        )
    }

    error(params)
    {
        console.error(params['text']+`
        Client Base server answer: `+params['code']+
        `, "`+params['message']+`"`)
    }
}
