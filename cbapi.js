/**
 * CBAPI.js 0.2.0
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
                this.error(response['code'], response['message'])
                return ''
            }
        }
        else
        {
            this.error(response['code'], response['message'])
            return ''
        }
    }

    error(code, text)
    {
        console.log('Client Base server answer: '+code+', "'+text+'"')
    }
}
