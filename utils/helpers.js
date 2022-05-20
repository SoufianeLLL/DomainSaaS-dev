import axios from 'axios'
const convert = require('xml-js')

const proxy = {
	IP: '209.127.96.250',
	port: 7845,
	username: 'tvesnauu',
	password: '9dte3zblrdls'
}


export const getURL = () => {
	const url = process?.env?.URL_HOMEPAGE && process.env.URL_HOMEPAGE !== '' 
		? process.env.URL_HOMEPAGE : 'https://onedomain.io'

	return url.includes('http') ? url : `https://${url}`
}


export const postData = async ({ url, token, data={}, auth='', method='POST', contentType='application/json' }) => {
	const res = await fetch(url, {
		method: method,
		headers: new Headers({ 
			token,
			'Authorization': auth,
			'Content-Type': contentType, 
			'Access-Control-Allow-Origin': '*',
		}),
		body: data ? JSON.stringify(data) : null
	})
	if (await res?.error) {
		throw error
	}
	return await res.json().catch(err => {
		return null
	})
}


export const getData = async ( url, auth, contentType='application/json', withProxy=false ) => {
	const headers = {
		'Content-Type': contentType, 
		'Authorization': auth,
		'Access-Control-Allow-Origin': '*',
	}
	if (!withProxy) {
		const res = await fetch(url, {
			headers: new Headers(headers),
		})
		if (res.error) {
			throw error
		}
		return await res.json()
	}
	else {
		const res = await axios({
			url: url,
			proxy: {
				host: proxy?.IP,
				port: proxy?.port,
				auth: {
					username: proxy?.username,
					password: proxy?.password
				}
			},
			headers: headers
		})
		const result = await res.data
		if (contentType === 'application/json') {
			return result
		}
		return await JSON.parse(convert.xml2json(result))
	}
}


export const sendXRequest = async ({ url, auth, method='GET', body={}, contentType='application/json' }) => {
	let res, headers = new Headers({ 
		'X-Api-Key': auth,
		'Content-Type': contentType, 
		'Access-Control-Allow-Origin': '*',
	})
	if (method === 'GET') {
		res = await fetch(url, { method, headers })
		console.log(res)
		console.log(res?.json())
	}
	else {
		res = await fetch(url, { method, headers, body })
	}
	if (res.error) {
		throw error
	}
	return await res?.json()
		.catch(err => {
			if (res?.status !== 500) return { success: 'YES' }
			else return null
		})
}


export const toDateTime = (secs) => {
	var t = new Date('1970-01-01T00:30:00Z')
	t.setSeconds(secs)

	return t
}