
const domainDetails = async (registrars, domain) => {
	
	let url,
		rewrite,
		insert,
		result,
		reg = domain?.registrar,
		api = registrars?.registrar_name ? registrars : registrars.find(r => r.registrar_name === reg)

	if (reg && api?.registrar_key) {
		
		
		if (reg?.toLowerCase() === 'godaddy') {
			rewrite = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.godaddy.com' : 'https://api.godaddy.com')

			url = `${rewrite}/v1/domains/${domain?.domain}`
			if (url) {
				await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/godaddy`,{
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						request: url,
						authorization: `sso-key ${api.registrar_key}:${api.registrar_secret}`,
						method: 'GET'
					})
				})
				.then(async (res) => {
					try {
						const data = await res.json()
						insert = {
							domain: domain?.domain,
							metadata: {
								...domain?.metadata,
								locked: data?.locked,
								renewAuto: data?.renewAuto,
								nameServers: data?.nameServers ?? null,
								domain_verification: data?.verifications?.domainName?.status ?? null,
								realname_verification: data?.verifications?.realName?.status ?? null,
								country: data?.contactAdmin?.addressMailing?.country ?? null,
								city: data?.contactAdmin?.addressMailing?.city ?? null,
								state: data?.contactAdmin?.addressMailing?.state ?? null,
								address1: data?.contactAdmin?.addressMailing?.address1 ?? null,
								email: data?.contactAdmin?.email ?? null,
								firstname: data?.contactAdmin?.nameFirst ?? null,
								lastname: data?.contactAdmin?.nameLast ?? null,
								zipecode: data?.contactAdmin?.addressMailing?.postalCode ?? null,
								phone: data?.contactAdmin?.phone ?? null,
							}
						}
					}
					catch (err) {
						return result = {
							error: res?.statusText ?? `Unauthorized: Access is denied due.`,
							code: res?.status ?? 401
						}
					}
				})
				.catch(async (err) => {
					return result = {
						error: `An error was occurred: ${err}`,
					}
				})
			}
		}

		
		if (reg?.toLowerCase() === 'ionos') {
			rewrite = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.hosting.ionos.com/domains' : 'https://api.hosting.ionos.com/domains')

			url = `${rewrite}/v1/domainitems/${domain?.metadata?.domainId}/contacts`
			// url = `${rewrite}/v1/domainitems/${domain?.metadata?.domainId}?includeDomainStatus=true`
			if (url) {
				await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/ionos`,{
					method: 'POST',
					headers: {
						'Accept': 'application/json',
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({
						request: url,
						authorization: `${api.registrar_key}.${api.registrar_secret}`,
						method: 'GET'
					})
				})
				.then(async (res) => {
					try {
						const data = await res.json()
						insert = {
							domain: domain?.domain,
							metadata: {
								...domain?.metadata,
								state: null,
								city: data?.registrant?.postalInfo?.address?.city ?? null,
								address1: data?.registrant?.postalInfo?.address?.streets[0] ?? null,
								zipecode: data?.registrant?.postalInfo?.address?.postalCode ?? null,
								firstname: data?.registrant?.postalInfo?.firstName ?? null,
								lastname: data?.registrant?.postalInfo?.lastName ?? null,
								country: data?.registrant?.postalInfo?.address?.countryCode ?? null,
								email: data?.registrant?.email ?? null,
								phone: data?.registrant?.voice ?? null,
							}
						}
					}
					catch (err) {
						return result = {
							error: res?.statusText ?? `Unauthorized: Access is denied due.`,
							code: res?.status ?? 401
						}
					}
				})
				.catch(async (err) => {
					return result = {
						error: `An error was occurred: ${err}`,
					}
				})
			}
		}


		else if (reg?.toLowerCase() === 'name.com') {
			rewrite = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.name.com' : 'https://api.dev.name.com')

			url = `${rewrite}/v4/domains/${domain?.domain}`
			await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
				method: 'POST',
				headers: {
					'Accept': 'application/json',
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					request: url,
					authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
					method: 'GET'
				})
			})
			.then(async (res) => {
				const data = await res.json()
				if (data?.domainName) {
					insert = {
						domain: domain?.domain,
						metadata: {
							...domain?.metadata,
							locked: data?.locked,
							renewAuto: data?.autorenewEnabled,
							nameServers: data?.nameservers,
							country: data?.contacts?.registrant?.country,
							city: data?.contacts?.registrant?.city,
							state: data?.contacts?.registrant?.state,
							address1: data?.contacts?.registrant?.address1,
							email: data?.contacts?.registrant?.email,
							firstname: data?.contacts?.registrant?.firstName,
							lastname: data?.contacts?.registrant?.lastName,
							zipecode: data?.contacts?.registrant?.zip,
							phone: data?.contacts?.registrant?.phone,
						}
					}
				}
				else if (data?.message === 'Permission Denied') {
					return result = {
						error: res?.statusText ?? `Unauthorized: Access is denied due to invalid Name.com credentials.`
					}
				}
			})
			.catch(async (err) => {
				console.log(err)
				return result = {
					error: `An error was occurred: ${err}`
				}
			})
		}


		else if (reg?.toLowerCase() === 'namecheap') {
			// get contact result
			rewrite = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.namecheap.com' : 'https://api.sandbox.namecheap.com')

			let apiuser  = `ApiUser=${api.registrar_secret}`
			let username = `&UserName=${api.registrar_secret}`
			let apikey   = `&ApiKey=${api.registrar_key}`
			let command  = '&Command=namecheap.domains.getContacts'
			let clientIP = '&ClientIp=192.168.1.109'
			let domainn  = `&DomainName=${domain?.domain}`
			url = `${rewrite}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${domainn}`
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
							return result = {
								error: `Namecheap Error(${res?.elements[0]?.elements[0]?.elements[0]?.attributes.Number}): ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`,
								code: res?.elements[0]?.elements[0]?.elements[0]?.attributes.Number
							}
						}
					}
					if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.elements?.length > 0) {
						const data = res?.elements[0]?.elements[3]?.elements[0]?.elements[0].elements
						let p
						data.map(async (inf) => {
							switch (inf?.name) {
								case 'FirstName':
									p = {
										...p,
										firstname: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
								case 'LastName':
									p = {
										...p,
										lastname: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
								case 'Address1':
									p = {
										...p,
										address1: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
								case 'City':
									p = {
										...p,
										city: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
								case 'StateProvince':
									p = {
										...p,
										state: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
								case 'PostalCode':
									p = {
										...p,
										zipecode: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
								case 'Country':
									p = {
										...p,
										country: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
								case 'Phone':
									p = {
										...p,
										phone: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
								case 'EmailAddress':
									p = {
										...p,
										email: (inf?.elements ? inf?.elements[0]?.text : null) ?? null
									}
									break;
							}
						})
						insert = {
							domain: domain?.domain,
							metadata: {
								...domain?.metadata,
								...p
							}
						}
					}
					else {
						return result = {
							error: `Unauthorized: Access is denied due.`,
							code: 401
						}
					}
				})
				.catch((err) => {
					return result = {
						error: `An error was occurred: ${err}`,
					}
				})
			}
		}

		
	}
	return result
}

export default domainDetails