import domainDetails from './domainDetails'
import moment from 'moment'

const ip = '209.127.96.250'


const domainsPortfolio = async (
	/**
		const registrar = [
			registrar_name: 'GoDaddy' // Name.com, IONOS, Epik, Name.com..
			registrar_secret: 'secret key or null if the registrar dosen't offer one'
			registrar_key: 'public key or signature ...'
		]
	*/
	registrar
) => {

	let url, base, insert, portfolio = [], result = { success: true, error: null }
	
	if (registrar) {


		// GoDaddy.com
		if ((registrar?.registrar_name).toLowerCase() === 'godaddy') {
			portfolio = []
			base = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.godaddy.com' : 'https://api.ote-godaddy.com')

			url = `${base}/v1/domains?includes=contacts,nameServers`
			if (url) {
				await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/godaddy`,{
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						request: url,
						authorization: `sso-key ${registrar.registrar_key}:${registrar.registrar_secret}`,
						method: 'GET'
					})
				})
				.then(async (res) => {
					const data = await res.json()
					if (data && data?.length > 0) {
						await Promise.all(data.map(async (domain) => {
							insert = {
								domain: domain?.domain,
								registrar: 'GoDaddy',
								registrar_key: registrar?.registrar_key,
								uid: registrar?.uid,
								expires: moment(domain?.expires).format('YYYY-MM-DD'),
								status: (domain?.status)?.toLowerCase(),
								valuation: {},
								updated_at: moment(domain?.createdAt).format('YYYY-MM-DD'),
								metadata: {
									domain_verification: domain?.verifications?.domainName?.status ?? null,
									realname_verification: domain?.verifications?.realName?.status ?? null,
									country: domain?.contactAdmin?.addressMailing?.country ?? null,
									city: domain?.contactAdmin?.addressMailing?.city ?? null,
									state: domain?.contactAdmin?.addressMailing?.state ?? null,
									address1: domain?.contactAdmin?.addressMailing?.address1 ?? null,
									email: domain?.contactAdmin?.email ?? null,
									firstname: domain?.contactAdmin?.nameFirst ?? null,
									lastname: domain?.contactAdmin?.nameLast ?? null,
									zipecode: domain?.contactAdmin?.addressMailing?.postalCode ?? null,
									phone: domain?.contactAdmin?.phone ?? null,
									createdAt: moment(domain?.createdAt).format('YYYY-MM-DD'),
									renewAuto: domain?.renewAuto ?? null,
									domainId: domain?.domainId ?? null,
									locked: domain?.locked ?? null,
									exposeWhois: domain?.exposeWhois ?? null,
									expirationProtected: domain?.expirationProtected ?? null,
									nameServers: domain?.nameServers ?? null,
									privacy: domain?.privacy ?? null,
									renewable: domain?.renewable ?? null,
									transferProtected: domain?.transferProtected ?? null,
									holdRegistrar: domain?.holdRegistrar ?? null,
									renewDeadline: moment(domain?.renewDeadline).format('YYYY-MM-DD')
								},
								created_at: ((new Date()).toISOString()).toLocaleString('en-US')
							}
							portfolio = [...portfolio, insert]
						}))
					}
					else {
						result = { success: false, error: `Unauthorized: Access is denied due to invalid GoDaddy credentials.` }
					}
				})
				.catch(async (err) => {
					result = { success: false, error: `An error was occurred: ${err}` }
				})
			}
		}


		// epik.com
		if ((registrar?.registrar_name).toLowerCase() === 'epik') {
			portfolio = []
			base = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://usersapiv2.epik.com/v2' : 'https://usersapiv2.epik.com/v2')

			url = `${base}/domains?SIGNATURE=${registrar.registrar_key}&current_page=1&per_page=100`
			if (url) {
				await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/epik`,{
					method: 'POST',
					headers: {
						'Accept': 'application/json',
					},
					body: JSON.stringify({
						request: url,
						method: 'GET',
						data: null
					})
				})
				.then(async (res) => {
					const data = await res.json()
					if (data && data?.length > 0) {
						await Promise.all(data.map(async (domain) => {
							insert = {
								domain: domain?.domain,
								registrar: 'Epik',
								registrar_key: registrar?.registrar_key,
								uid: registrar?.uid,
								expires: moment(domain?.expiration_date).format('YYYY-MM-DD'),
								status: (domain?.status)?.toLowerCase(),
								valuation: {},
								updated_at: moment(domain?.registration_date).format('YYYY-MM-DD'),
								metadata: {
									renewAuto: domain?.auto_renew ?? null,
									nameServers: domain?.name_servers ?? null,
									locked: domain?.locked ?? null,
									renewDeadline: moment(domain?.expiration_date).format('YYYY-MM-DD'),
									// country: domain?.contactAdmin?.addressMailing?.country ?? null,
									// city: domain?.contactAdmin?.addressMailing?.city ?? null,
									// state: domain?.contactAdmin?.addressMailing?.state ?? null,
									// address1: domain?.contactAdmin?.addressMailing?.address1 ?? null,
									// email: domain?.contactAdmin?.email ?? null,
									// firstname: domain?.contactAdmin?.nameFirst ?? null,
									// lastname: domain?.contactAdmin?.nameLast ?? null,
									// zipecode: domain?.contactAdmin?.addressMailing?.postalCode ?? null,
									// phone: domain?.contactAdmin?.phone ?? null,
									createdAt: moment(domain?.registration_date).format('YYYY-MM-DD'),
									domainId: domain?.domainId ?? null,
									exposeWhois: domain?.exposeWhois ?? null,
									expirationProtected: domain?.expirationProtected ?? null,
									privacy: domain?.privacy ?? null,
									renewable: domain?.renewable ?? null,
									transferProtected: domain?.transferProtected ?? null,
									holdRegistrar: domain?.holdRegistrar ?? null,
								},
								created_at: ((new Date()).toISOString()).toLocaleString('en-US')
							}
							portfolio = [...portfolio, insert]
						}))
					}
					else {
						result = { success: false, error: `Unauthorized: Access is denied due to invalid Epik signature.` }
					}
				})
				.catch(async (err) => {
					result = { success: false, error: `An error was occurred: ${err}` }
				})
			}
		}


		// Ionos.com
		if ((registrar?.registrar_name).toLowerCase() === 'ionos') {
			portfolio = []
			base = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.hosting.ionos.com/domains' : 'https://api.hosting.ionos.com/domains')

			url = `${base}/v1/domainitems?limit=1000`
			if (url) {
				await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/ionos`,{
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json',
					},
					body: JSON.stringify({
						request: url,
						authorization: `${registrar.registrar_key}.${registrar.registrar_secret}`,
						method: 'GET',
						data: null
					})
				})
				.then(async (res) => {
					const data = await res.json()
					if (data?.domains && data?.domains?.length > 0) {
						await Promise.all(data?.domains.map(async (domain) => {
							url = `${base}/v1/domainitems/${domain?.id}?includeDomainStatus=true`
							if (url) {
								await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/ionos`,{
									method: 'POST',
									headers: {
										'Accept': 'application/json',
										'Content-Type': 'application/json',
									},
									body: JSON.stringify({
										request: url,
										authorization: `${registrar.registrar_key}.${registrar.registrar_secret}`,
										method: 'GET',
										data: null
									})
								})
								.then(async (res) => {
									const dom = await res.json()
									if (dom?.name && dom?.id) {
										insert = {
											domain: dom?.name,
											registrar: 'IONOS',
											registrar_key: registrar?.registrar_key,
											uid: registrar?.uid,
											expires: moment(dom?.expirationDate).format('YYYY-MM-DD'),
											status: (dom?.status?.provisioningStatus?.type).toLowerCase() ?? 'active',
											valuation: {},
											updated_at: null,
											metadata: {
												renewAuto: dom?.autoRenew ?? null,
												domainId: dom?.id ?? null,
												locked: dom?.transferLock ?? false,
												exposeWhois: !dom?.privacyEnabled ?? true,
												expirationProtected: !dom?.cancelOnExpire ?? null,
												nameServers: null,
												privacy: dom?.privacyEnabled ?? false,
												renewable: dom?.isAutoRenewSwitchable ?? null,
												transferProtected: dom?.transferLock ?? null,
											},
											created_at: ((new Date()).toISOString()).toLocaleString('en-US')
										}
										portfolio = [...portfolio, insert]
									}
								})
								.catch(async (err) => {
									result = { success: false, error: `An error was occurred: ${err}` }
								})
							}
						}))
					}
					else {
						result = { success: false, error: `Unauthorized: Access is denied due to invalid IONOS credentials.` }
					}
				})
				.catch(async (err) => {
					result = { success: false, error: `An error was occurred: ${err}` }
				})
			}
		}


		// Name.com
		else if ((registrar?.registrar_name).toLowerCase() === 'name.com') {
			portfolio = []
			base = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.name.com' : 'https://api.dev.name.com')

			url = `${base}/v4/domains`
			await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					request: url,
					authorization: `Basic ${Buffer.from(registrar.registrar_secret + ":" + registrar.registrar_key).toString('base64')}`,
					method: 'GET'
				})
			})
			.then(async (res) => {
				const data = await res.json()
				if (data?.domains && data?.domains.length > 0) {
					await Promise.all(data.domains.map(async (domain) => {
						insert = {
							domain: domain?.domainName,
							registrar: 'Name.com',
							registrar_key: registrar?.registrar_key,
							uid: registrar?.uid,
							expires: moment(domain?.expireDate).format('YYYY-MM-DD'),
							status: 'active',
							valuation: {},
							metadata: {
								createdAt: moment(domain?.createDate).format('YYYY-MM-DD'),
								renewAuto: domain?.autorenewEnabled,
								domainId: null,
								locked: domain?.locked === 'true' ? true : false,
								exposeWhois: true,
								expirationProtected: null,
								nameServers: null,
								privacy: false,
								renewable: true,
								transferProtected: null,
								renewDeadline: null
							},
							created_at: ((new Date()).toISOString()).toLocaleString('en-US')
						}
						portfolio = [...portfolio, insert]
					}))
				}
				else if (data?.message === 'Permission Denied') {
					result = { success: false, error: data?.details ?? `Unauthorized: Access is denied due to invalid Name.com credentials.` }
				}
			})
			.catch(async (err) => {
				result = { success: false, error: `An error was occurred: ${err}` }
			})
		}

		
		// Namecheap.com
		else if ((registrar?.registrar_name).toLowerCase() === 'namecheap') {
			base = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.namecheap.com' : 'https://api.sandbox.namecheap.com')

			let apiuser  = `ApiUser=${registrar.registrar_secret}`
			let username = `&UserName=${registrar.registrar_secret}`
			let apikey   = `&ApiKey=${registrar.registrar_key}`
			let command  = '&Command=namecheap.domains.getList'
			let clientIP = `&ClientIp=${ip}`
			let pageSize = '&pageSize=100'
			portfolio = []
			url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${pageSize}&page=1`
			if (url) {
				await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecheap`,{
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						request: url
					})
				})
				.then(async (res) => await res.json())
				.then(async (res) => {
					if (typeof res?.elements[0]?.elements[0]?.elements !== 'undefined') {
						if (res?.elements[0]?.elements[0]?.name === 'Errors' && res?.elements[0]?.elements[0]?.elements.length > 0) {
							result = { success: false, error: `Namecheap Error(${res?.elements[0]?.elements[0]?.elements[0]?.attributes.Number}): ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}` }
						}
					}
					if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.elements?.length > 0) {
						let data = res?.elements[0]?.elements[3]?.elements[0]?.elements
						const items = res?.elements[0]?.elements[3]?.elements[1]?.elements[0]?.elements[0]?.text ?? 0
						const pg = ((items / 100) - Math.trunc(items / 100)) > 0 ? (Math.trunc(items / 100) + 1) : 0
						if (pg > 1) {
							for (let p = 2; p <= pg; p++) {
								url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${pageSize}&page=${p}`
								if (url) {
									await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecheap`,{
										method: 'POST',
										headers: {
											'Accept': 'application/json',
											'Content-Type': 'application/json'
										},
										body: JSON.stringify({
											request: url
										})
									})
									.then(async (res) => await res.json())
									.then(async (res) => {
										if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.elements?.length > 0) {
											const paf = res?.elements[0]?.elements[3]?.elements[0]?.elements
											data = [].concat(data, paf)
										}
									})
									.catch(async (err) => {})
								}
							}
						}
						await Promise.all(data.map(async (domain) => {
							if (domain.name === 'Domain') {
								insert = {
									domain: domain?.attributes?.Name,
									registrar: 'Namecheap',
									registrar_key: registrar?.registrar_key,
									uid: registrar?.uid,
									expires: moment(domain?.attributes?.Expires).format('YYYY-MM-DD'),
									status: domain?.attributes?.IsExpired === 'true' ? 'expired' : 'active',
									valuation: {},
									metadata: {
										createdAt: moment(domain?.attributes?.Created).format('YYYY-MM-DD'),
										renewAuto: domain?.attributes?.AutoRenew === 'true' ? true : false,
										domainId: domain?.attributes?.ID,
										locked: domain?.attributes?.IsLocked === 'true' ? true : false,
										exposeWhois: domain?.attributes?.WhoisGuard === 'ENABLED' ? false : true,
										expirationProtected: null,
										nameServers: null,
										privacy: false,
										renewable: true,
										transferProtected: null,
										renewDeadline: null
									},
									created_at: ((new Date()).toISOString()).toLocaleString('en-US')
								}
								portfolio = [...portfolio, insert]
							}
						}))
					}
					else {
						result = { 
							success: false, error: res?.elements[0]?.elements[0]?.elements[0]?.attributes?.Number === '1011150' 
								? 'Unauthorized: Access is denied due to invalid IP address, please whitelist our IP address 209.127.96.250' 
								: (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' 
									? `Unauthorized: Access is denied due to invalid Namecheap credentials.` 
									: res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text) 
						}
					}
				})
				.catch(async (err) => {
					result = { success: false, error: `An error was occurred: ${err}` }
				})
			}
		}

	}


	if (!result?.error) {
		await Promise.all(portfolio.map(async (domain) => {
			// Get domains contacts info
			if (
				// Onlly if the registrar dosen't support fetching the contact info 
				// with the domains details such servernames, expiration date...
				// GoDaddy is an example for this case
				((registrar?.registrar_name).toLowerCase() === 'name.com') || 
				((registrar?.registrar_name).toLowerCase() === 'ionos') || 
				((registrar?.registrar_name).toLowerCase() === 'namecheap')
			) {
				await domainDetails(registrar, domain)
			}
		}))
	}

	/**
	 * portfolio must contain a list of all the domain name on the registrar database
	 */
	return result

}

export default domainsPortfolio