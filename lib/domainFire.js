const ip = '209.127.96.250'

const domainFire = async (request, domainInfo, registrars, body=null) => {
	let url,
		base,
		insert,
		result,
		req = request?.request, /**
			changeContacts
			resetNS
			renewDomain
			changeNS
			lock
			unlock
			privacyOn
			privacyOff
			cancelAutoRenew
			enableAutoRenew
			addRecord
			deleteRecord
			dns_records
		*/
		registrar = domainInfo?.registrar, /**
			GoDaddy
			IONOS
			Name.com
			Namecheap
			...
		*/
		domain = domainInfo?.domain, /**
			eg: google.com
		*/
		api = registrars.find(r => r.registrar_key === domainInfo?.registrar_key) /**
			– domainInfo: contains the domain information needed for API requests such expiration date, domain name... 
		*/

	
	if (api && req && registrar && domain) {
		



		//  Godaddy
		if (registrar?.toLowerCase() === 'godaddy') {
			base = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.godaddy.com' : 'https://api.godaddy.com')

			if (req === 'changeContacts' && domain && body) {
				url = `${base}/v1/domains/${domain}/contacts`
				let cs = {
					addressMailing: {
						address1: body?.address1,
						city: body?.city,
						country: body?.country,
						postalCode: body?.zipecode,
						state: body?.state
					},
					email: body?.email,
					nameFirst: body?.firstname,
					nameLast: body?.lastname,
					phone: body?.phone
				}
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
							method: 'PATCH',
							data: {
								"contactAdmin": cs,
								"contactBilling": cs,
								"contactRegistrant": cs,
								"contactTech": cs
							}
						})
					})
					.then(async (data) => {
						let res = await data.json()
						if (res?.code) {
							if (res?.message) {
								return result = {
									error: (res?.code === 'CONFLICTING_STATUS' 
										? 'There is an update awaiting your confirmation before you can make another update, please check your email associated with your GoDaddy.' 
										: `Wrong request: Please check your address details and send again.`)
									// error: `Wrong request: ${res?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: {
									country: body?.country,
									city: body?.city,
									state: body?.state,
									companyname: null,
									address1: body?.address1,
									address2: null,
									email: body?.email,
									firstname: body?.firstname,
									lastname: body?.lastname,
									zipecode: body?.zipecode,
									phone: body?.phone
								},
								success: 'Your address has been successfully changed, but you may need to check your email associated with your GoDaddy to accept the changes!'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'resetNS' && domain) {
				url = `${base}/v1/domains/${domain}/records`
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
							method: 'PATCH',
							data: [
								{
									name: "@",
									ttl: 3600,
									data: "ns77.domaincontrol.com",
									type: "NS"
								},{
									name: "@",
									ttl: 3600,
									data: "ns78.domaincontrol.com",
									type: "NS"
								}
							]
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							const data = await res.json()
							return result = {
								returnedData: data?.nameservers,
								success: 'Your nameservers has been successfully updated.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'renewDomain' && domain && body) {
				let aYearFromNow = new Date(domainInfo?.expires)
				const plus = aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1)
				url = `${base}/v1/domains/${domain}/renew`
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
							method: 'POST',
							data: {
								period: body?.period ?? 1
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields && data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							else if (data?.message) {
								return result = {
									error: `Wrong request: ${data?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: moment(plus).format('YYYY-MM-DD'),
								success: `Your domain ${domain} has been successfully renewed.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'changeNS' && domain && body) {
				url = `${base}/v1/domains/${domain}/records`
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
							method: 'PATCH',
							data: [
								{
									name: "@",
									ttl: 3600,
									data: body[0],
									type: "NS"
								},{
									name: "@",
									ttl: 3600,
									data: body[1],
									type: "NS"
								}
							]
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: body ? [body[0], body[1]] : null,
								success: 'Your nameservers has been successfully updated.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'lock' && domain) {
				url = `${base}/v1/domains/${domain}`
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
							method: 'PATCH',
							data: {
								locked: true
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: true,
								success: 'Your domain has been successfully locked, it cannot be transferred to another registrar.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'unlock' && domain) {
				url = `${base}/v1/domains/${domain}`
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
							method: 'PATCH',
							data: {
								locked: false
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: false,
								success: 'Your domain has been successfully unlocked, it can be transferred to another registrar.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'privacyOn' && domain && body) {
				url = `${base}/v1/domains/${domain}`
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
							method: 'PATCH',
							data: {
								exposeWhois: false,
								consent: {
									agreedAt: ((new Date()).toISOString()).toLocaleString('en-US'),
									agreedBy: body?.fullname,
									agreementKeys: [
										"EXPOSE_WHOIS"
									]
								}
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: false,
								success: 'Your domain privacy has been successfully enabled, no one can see your WHOIS information.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'privacyOff' && domain && body) {
				url = `${base}/v1/domains/${domain}`
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
							method: 'PATCH',
							data: {
								exposeWhois: true,
								consent: {
									agreedAt: ((new Date()).toISOString()).toLocaleString('en-US'),
									agreedBy: body?.fullname,
									agreementKeys: [
										"EXPOSE_WHOIS"
									]
								}
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: true,
								success: 'Your domain privacy has been successfully disabled, anyone can see your WHOIS information.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'cancelAutoRenew' && domain) {
				url = `${base}/v1/domains/${domain}`
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
							method: 'PATCH',
							data: {
								renewAuto: false
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: false,
								success: 'Your domain will not be automatically renewed, this requiring the domain to be renewed manually.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'enableAutoRenew' && domain) {
				url = `${base}/v1/domains/${domain}`
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
							method: 'PATCH',
							data: {
								renewAuto: true
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							return result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							return result = {
								returnedData: true,
								success: 'Your domain will be automatically renewed when it gets close to expiring'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'addRecord' && domain && body) {
				url = `${base}/v1/domains/${domain}/records`
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
							method: 'PATCH',
							data: [body]
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message && data?.details) {
							return result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							return result = {
								returnedData: {
									name: body?.name,
									data: body?.data,
									ttl: body?.ttl,
									type: body?.type,
								},
								success: 'Your new record has been successfully added.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'deleteRecord' && domain && body) {
				url = `${base}/v1/domains/${domain}/records/${body?.type}/${body?.name}`
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
							method: 'DELETE',
							data: null
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: null,
								success: 'Your record has been successfully deleted.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'dns_records' && domain) {
				url = `${base}/v1/domains/${domain}/records`
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
							method: 'GET',
							data: null
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.length > 0) {
							result = []
							data?.map((rec) => {
								insert = {
									name: rec?.name,
									data: rec?.data,
									ttl: rec?.ttl,
									type: rec?.type,
								}
								result = [...result, insert]
							})
						}
						else {
							return result = {
								error: `You don't have any records to display for this domain.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}

		}


		//  IONOS
		if (registrar?.toLowerCase() === 'ionos') {
			base = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.hosting.ionos.com' : 'https://api.hosting.ionos.com')

			if (req === 'changeContacts' && domain && body) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/contacts`
				let cs = {
					type: "USER_DATA",
					postalInfo: {
						name: body?.firstname + ' ' + body?.lastname,
						firstName: body?.firstname,
						lastName: body?.lastname,
						address: {
							streets: [
								`${body?.address1}`
							],
							countryCode: body?.country,
							postalCode: body?.zipecode,
							city: body?.city,
						}
					},
					voice: body?.phone,
					email: body?.email
				}
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
							method: 'PUT',
							data: {
								"registrant": cs,
								"technical": cs,
								"admin": cs
							}
						})
					})
					.then(async (data) => {
						let res = await data.json()
						if (res?.code) {
							if (res?.message) {
								return result = {
									error: `Wrong request: ${res?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: {
									country: body?.country,
									city: body?.city,
									state: body?.state,
									companyname: null,
									address1: body?.address1,
									address2: null,
									email: body?.email,
									firstname: body?.firstname,
									lastname: body?.lastname,
									zipecode: body?.zipecode,
									phone: body?.phone
								},
								success: 'Your address has been successfully changed!'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'resetNS' && domain) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/nameservers`
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
							method: 'PUT',
							data: {
								nameservers: [
									{
										name: "ns1ZZZ.ui-dns.de"
									},
									{
										name: "ns1ZZZ.ui-dns.biz"
									},
									{
										name: "ns1ZZZ.ui-dns.org"
									},
									{
										name: "ns1ZZZ.ui-dns.com"
									}
								]
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code && data?.message) {
							if (data?.message) {
								return result = {
									error: `Wrong request: ${data?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							const nservers = [
								"ns1ZZZ.ui-dns.de",
								"ns1ZZZ.ui-dns.biz",
								"ns1ZZZ.ui-dns.org",
								"ns1ZZZ.ui-dns.com"
							]
							return result = {
								returnedData: nservers,
								success: 'Your nameservers has been successfully updated.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'changeNS' && domain && body) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/nameservers`
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
							method: 'PUT',
							data: {
								nameservers: [
									{
										name: body[0]
									},
									{
										name: body[1]
									}
								]
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: body,
								success: 'Your nameservers has been successfully updated.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'lock' && domain) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/statuses`
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
							method: 'PUT',
							data: {
								domainStatuses: {
									clientTransferProhibited: {
										value: true,
										reasons: [{
											intent: "client_request"
										}]
									}
								}
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: true,
								success: 'Your domain has been successfully locked, it cannot be transferred to another registrar.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'unlock' && domain) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/statuses`
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
							method: 'PUT',
							data: {
								domainStatuses: {
									clientTransferProhibited: {
										value: false,
										reasons: [{
											intent: "client_request"
										}]
									}
								}
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: false,
								success: 'Your domain has been successfully unlocked, it can be transferred to another registrar.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'privacyOn' && domain) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/privacy`
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
							method: 'PUT',
							data: {
								enabled: true
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: false,
								success: 'Your domain privacy has been successfully enabled, no one can see your WHOIS information.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'privacyOff' && domain) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/privacy`
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
							method: 'PUT',
							data: {
								enabled: false
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: true,
								success: 'Your domain privacy has been successfully disabled, anyone can see your WHOIS information.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'cancelAutoRenew' && domain) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/statuses`
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
							method: 'PATCH',
							data: {
								domainStatuses: {
									clientRenewProhibited: {
										value: false,
										reasons: [{
											intent: "client_request"
										}]
									}
								}
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code) {
							if (data?.fields[0]?.message) {
								return result = {
									error: `Wrong request: ${data?.fields[0]?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: false,
								success: 'Your domain will not be automatically renewed, this requiring the domain to be renewed manually.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'enableAutoRenew' && domain) {
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/statuses`
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
							method: 'PUT',
							data: {
								domainStatuses: {
									clientRenewProhibited: {
										value: true,
										reasons: [{
											intent: "client_request"
										}]
									}
								}
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							return result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							return result = {
								returnedData: true,
								success: 'Your domain will be automatically renewed when it gets close to expiring'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'addRecord' && domain && body) {
				// Get zones 
				url = `${base}/dns/v1/zones`
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
						const zones = await res.json()
						await Promise.all(zones?.map(async (zone) => {
							if (zone?.name === domain) {
								// Add record
								url = `${base}/dns/v1/zones/${zone?.id}/records`
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
											method: 'POST',
											data: [{
												name: body?.host,
												type: body?.type,
												content: body?.answer,
												ttl: body?.ttl ?? 3600,
												prio: body?.priority ?? 10,
												disabled: false
											}]
										})
									})
									.then(async (res) => {
										const data = await res.json()
										if (data?.message && data?.code) {
											return result = {
												error: `Wrong request: ${data?.message}`
											}
										}
										else if (data?.length > 0 && data[0]?.message && data[0]?.code) {
											return result = {
												error: `Wrong request: ${data[0]?.message}`
											}
										}
										else {
											return result = {
												returnedData: {
													name: body?.name,
													data: body?.data,
													ttl: body?.ttl,
													type: body?.type,
												},
												success: 'Your new record has been successfully added.'
											}
										}
									})
									.catch((err) => {
										return result = {
											error: `Wrong request, please try again or contact support.`
										}
									})
								}
							}
						}))
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'deleteRecord' && domain && body) {
				url = `${base}/dns/v1/zones/${body?.zoneId}/records/${body?.id}`
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
							method: 'DELETE'
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.code || data?.message) {
							if (data?.message) {
								return result = {
									error: `Wrong request: ${data?.message}`
								}
							}
							return result = {
								error: `Wrong request: Please check if your contacts details are correct and try again.`
							}
						}
						else {
							return result = {
								returnedData: null,
								success: 'Your record has been successfully deleted.'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'dns_records' && domain) {
				result = []
				// Namseservers
				url = `${base}/domains/v1/domainitems/${domainInfo?.metadata?.domainId}/nameservers`
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
							method: 'GET',
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.nameservers && data?.nameservers?.length > 0) {
							await Promise.all(data?.nameservers.map((rec) => {
								insert = {
									id: rec?.id,
									data: rec?.name,
									type: 'ns',
								}
								result = [...result, insert]
							}))
						}
						else {
							return result = {
								error: `You don't have any nameservers to display for this domain.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
				// DNS records
				url = `${base}/dns/v1/zones`
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
							method: 'GET',
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.length > 0) {
							await Promise.all(data.map(async (zone) => {
								if (zone && zone?.name === domain) {
									url = `${base}/dns/v1/zones/${zone?.id}`
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
												method: 'GET',
											})
										})
										.then(async (res) => {
											const records = await res.json()
											if (records?.records && records?.records?.length > 0) {
												await Promise.all(records?.records.map((rec) => {
													if ((rec?.type).toLowerCase() !== 'ns') {
														insert = {
															name: rec?.name,
															data: rec?.content,
															ttl: rec?.ttl,
															type: rec?.type,
															active: !rec?.disabled,
															id: rec?.id,
															zoneId: zone?.id
														}
													}
													result = [...result, insert]
												}))
											}
											else {
												return result = {
													error: `You don't have any records to display for this domain.`
												}
											}
										})
										.catch((err) => {
											return result = {
												error: `Wrong request, please try again or contact support.`
											}
										})
									}
								}
							}))
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}

		}


		// Name.com
		if (registrar?.toLowerCase() === 'name.com') {
			base = (process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.name.com' : 'https://api.dev.name.com')

			if (req === 'dns_records' && domain) {
				url = `${base}/v4/domains/${domain}/records`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'GET',
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.records?.length > 0) {
							result = []
							data?.records.map((rec) => {
								insert = {
									id: rec?.id,
									fqdn: rec?.fqdn,
									name: rec?.host,
									data: rec?.answer,
									ttl: rec?.ttl,
									type: rec?.type,
								}
								result = [...result, insert]
							})
						}
						else {
							result = {
								error: `You don't have any records to display for this domain.`
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'resetNS' && domain) {
				url = `${base}/v4/domains/${domain}:setNameservers`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST',
							data: {
								nameservers: [
									"ns1.name.com",
									"ns2.name.com"
								]
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						result = {
							returnedData: data?.nameservers,
							success: 'Your nameservers has been successfully updated.'
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'changeNS' && domain && body) {
				url = `${base}/v4/domains/${domain}:setNameservers`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST',
							data: {
								nameservers: body 
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message && data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: data?.nameservers,
								success: 'Your nameservers has been successfully updated.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'addRecord' && domain && body) {
				url = `${base}/v4/domains/${domain}/records`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST',
							data: body
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message && data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: {
									id: data?.id,
									fqdn: data?.fqdn,
									name: data?.host,
									data: data?.answer,
									ttl: data?.ttl,
									type: data?.type,
								},
								success: 'Your new record has been successfully added.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'deleteRecord' && domain && body) {
				url = `${base}/v4/domains/${domain}/records/${body}`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'DELETE'
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: null,
								success: 'Your record has been successfully deleted.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'lock' && domain) {
				url = `${base}/v4/domains/${domain}:lock`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST'
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: true,
								success: 'Your domain has been successfully locked, it cannot be transferred to another registrar.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'unlock' && domain) {
				url = `${base}/v4/domains/${domain}:unlock`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST'
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: false,
								success: 'Your domain has been successfully unlocked, it can be transferred to another registrar.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'privacyOn' && domain) {
				url = `${base}/v4/domains/${domain}:enableWhoisPrivacy`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST'
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: true,
								success: 'Your domain privacy has been successfully enabled, no one can see your WHOIS information.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'privacyOff' && domain) {
				url = `${base}/v4/domains/${domain}:disableWhoisPrivacy`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST'
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: false,
								success: 'Your domain privacy has been successfully disabled, anyone can see your WHOIS information.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'cancelAutoRenew' && domain) {
				url = `${base}/v4/domains/${domain}:disableAutorenew`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST'
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: false,
								success: 'Your domain will not be automatically renewed, this requiring the domain to be renewed manually.'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'enableAutoRenew' && domain) {
				url = `${base}/v4/domains/${domain}:enableAutorenew`
				if (url) {
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST'
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							result = {
								error: `Wrong request: ${data?.details}`
							}
						}
						else {
							result = {
								returnedData: true,
								success: 'Your domain will be automatically renewed when it gets close to expiring'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'changeContacts' && domain && body) {
				url = `${base}/v4/domains/${domain}:setContacts`
				if (url) {
					let cs = {
						"country": body?.country,
						"city": body?.city,
						"state": body?.state,
						"address1": body?.address1,
						"email": body?.email,
						"firstName": body?.firstname,
						"lastName": body?.lastname,
						"phone": body?.phone,
						"zip": body?.zipecode
					}
					await fetch(`${process.env.NEXT_PUBLIC_URL_HOMEPAGE}/api/connect/namecom`,{
						method: 'POST',
						headers: {
							'Accept': 'application/json',
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							request: url,
							authorization: `Basic ${Buffer.from(api.registrar_secret + ":" + api.registrar_key).toString('base64')}`,
							method: 'POST',
							data: {
								"contacts": {
									"admin": cs,
									"billing": cs,
									"registrant": cs,
									"tech": cs
								}
							}
						})
					})
					.then(async (res) => {
						const data = await res.json()
						if (data?.message || data?.details) {
							result = {
								error: `Wrong request: ${data?.details ?? data?.message}`
							}
						}
						else {
							result = {
								returnedData: {
									country: body?.country,
									city: body?.city,
									state: body?.state,
									companyname: null,
									address1: body?.address1,
									address2: null,
									email: body?.email,
									firstname: body?.firstname,
									lastname: body?.lastname,
									zipecode: body?.zipecode,
									phone: body?.phone
								},
								success: 'Your address has been successfully changed!'
							}
						}
					})
					.catch((err) => {
						result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}

		}


		// Namecheap
		if (registrar?.toLowerCase() === 'namecheap') {
			base = process.env.NEXT_PUBLIC_IS_PRODUCTION === 'TRUE' ? 'https://api.namecheap.com' : 'https://api.sandbox.namecheap.com'

			if (req === 'privacyOff' && domain) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command1 = '&Command=namecheap.domains.getinfo'
				let command2 = '&Command=Namecheap.Whoisguard.disable'
				let clientIP = `&ClientIp=${ip}`
				let whoisid1 = `&DomainName=${domain}`
				let ID
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command1}${clientIP}${whoisid1}`
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
									error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.elements?.length > 0) {
							ID = res?.elements[0]?.elements[3]?.elements[0]?.elements[2].elements[0]?.elements[0]?.text
						}
						if (ID) {
							let whoisid2 = `&whoisguardid=${ID}`
							url = `${base}/xml.response?${apiuser}${apikey}${username}${command2}${clientIP}${whoisid2}`
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
												// error: `${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
												error: `You can't turn Off your privacy at this moment, please try again later.`
											}
										}
									}
									if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
										return result = {
											returnedData: true,
											success: 'Your domain privacy has been successfully enabled, no one can see your WHOIS information.'
										}
									}
								})
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'privacyOn' && domain && body) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command1 = '&Command=namecheap.domains.getinfo'
				let command2 = '&Command=Namecheap.Whoisguard.enable'
				let clientIP = `&ClientIp=${ip}`
				let whoisid1 = `&DomainName=${domain}`
				// let ftemail  = `&forwardedtoemail=aimax.frix@gmail.com`
				let ftemail  = `&forwardedtoemail=${body?.email}`
				let ID
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command1}${clientIP}${whoisid1}`
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
									error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.elements?.length > 0) {
							ID = res?.elements[0]?.elements[3]?.elements[0]?.elements[2].elements[0]?.elements[0]?.text
						}
						if (ID) {
							let whoisid2 = `&whoisguardid=${ID}`
							url = `${base}/xml.response?${apiuser}${apikey}${username}${command2}${clientIP}${whoisid2}${ftemail}`
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
												error: `Wrong: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
											}
										}
									}
									if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
										return result = {
											returnedData: false,
											success: 'Your domain privacy has been successfully enabled, no one can see your WHOIS information.'
										}
									}
								})
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'unlock' && domain) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.setRegistrarLock'
				let clientIP = `&ClientIp=${ip}`
				let whoisid  = `&DomainName=${domain}&LockAction=unlock`
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${whoisid}`
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
									error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
							return result = {
								returnedData: false,
								success: 'Your domain has been successfully unlocked, it can be transferred to another registrar.'
							}
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'lock' && domain) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.setRegistrarLock'
				let clientIP = `&ClientIp=${ip}`
				let whoisid  = `&DomainName=${domain}&LockAction=lock`
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${whoisid}`
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
									error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
							return result = {
								returnedData: true,
								success: 'Your domain has been successfully locked, it cannot be transferred to another registrar.'
							}
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'renewDomain' && domain && body) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.renew'
				let clientIP = `&ClientIp=${ip}`
				let whoisid  = `&DomainName=${domain}&Years=${parseInt(body?.period, 10) ?? 1}`
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${whoisid}`
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
								if (res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text) {
									return result = {
										error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
									}
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.elements?.length > 0) {
							let aYearFromNow = new Date(domainInfo?.expires)
							const plus = aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1)
							return result = {
								returnedData: moment(plus).format('YYYY-MM-DD'),
								success: `Your domain ${domain} has been successfully renewed, ${moment(plus).format('YYYY-MM-DD')}`
							}
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'changeContacts' && domain && body) {
				let c = {
					country: body?.country,
					city: body?.city?.match(/\b(\w)/g)?.join(''),
					state: body?.state?.match(/\b(\w)/g)?.join(''),
					address1: body?.address1,
					email: body?.email,
					firstname: body?.firstname,
					lastname: body?.lastname,
					phone: body?.phone,
					company: null,
					codepostal: body?.zipecode
				}
				let apiuser  = `ApiUser=${api.registrar_secret}`
				let username = `&UserName=${api.registrar_secret}`
				let apikey   = `&ApiKey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.setContacts'
				let clientIP = `&ClientIp=${ip}&DomainName=${domain}`
				let address  = `&AuxBillingFirstName=${c.firstname}&AuxBillingLastName=${c.lastname}&AuxBillingAddress1=${c.address1}&AuxBillingCity=${c.city}&AuxBillingOrganizationName=${c.company}&AuxBillingStateProvince=${c.state}&AuxBillingPostalCode=${c.codepostal}&AuxBillingCountry=${c.country}&AuxBillingPhone=${c.phone}&AuxBillingEmailAddress=${c.email}&TechFirstName=${c.firstname}&TechLastName=${c.lastname}&TechAddress1=${c.address1}&TechStateProvince=${c.state}&TechCity=${c.city}&TechPostalCode=${c.codepostal}&TechOrganizationName=${c.company}&TechCountry=${c.country}&TechPhone=${c.phone}&TechEmailAddress=${c.email}&AdminFirstName=${c.firstname}&AdminLastName=${c.lastname}&AdminAddress1=${c.address1}&AdminStateProvince=${c.state}&AdminPostalCode=${c.codepostal}&AdminOrganizationName=${c.company}&AdminCountry=${c.country}&AdminPhone=${c.phone}&AdminCity=${c.state}&AdminEmailAddress=${c.email}&RegistrantFirstName=${c.firstname}&RegistrantLastName=${c.lastname}&RegistrantAddress1=${c.address1}&RegistrantStateProvince=${c.state}&RegistrantPostalCode=${c.codepostal}&RegistrantCountry=${c.country}&RegistrantPhone=${c.phone}&RegistrantEmailAddress=${c.email}&RegistrantCity=${c.state}&RegistrantOrganizationName=${c.company}`
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${address}`
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
									error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
							return result = {
								returnedData: {
									country: body?.country,
									city: body?.city?.match(/\b(\w)/g)?.join(''),
									state: body?.state?.match(/\b(\w)/g)?.join(''),
									companyname: null,
									address1: body?.address1,
									address2: null,
									email: body?.email,
									firstname: body?.firstname,
									lastname: body?.lastname,
									zipecode: body?.zipecode,
									phone: body?.phone
								},
								success: 'Your address has been successfully changed!'
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'dns_records' && domain) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command2 = '&Command=namecheap.domains.dns.getList'
				let command1 = '&Command=namecheap.domains.dns.getHosts'
				let clientIP = `&ClientIp=${ip}`
				let props    = `&SLD=${domain.split(/\./)[0]}&TLD=${domain.replace(domain.split(/\./)[0]+'.', '')}`
				result       = []
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command1}${clientIP}${props}`
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
								if (res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text) {
									return result = {
										error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
									}
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.elements?.length > 0) {
							var data = res?.elements[0]?.elements[3]?.elements[0]?.elements
							data?.map((rec) => {
								insert = {
									id: rec?.attributes?.HostId,
									name: rec?.attributes?.Name,
									data: rec?.attributes?.Address,
									ttl: rec?.attributes?.TTL ?? 3600,
									type: rec?.attributes?.Type,
								}
								result = [...result, insert]
							})
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
						else {
							return result = {
								error: `You don't have any records to display for this domain.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command2}${clientIP}${props}`
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
							var data = res?.elements[0]?.elements[3]?.elements[0]?.elements
							if (result?.error) {
								result = []
								data?.map((rec) => {
									insert = {
										name: rec?.ame,
										data: rec?.elements[0]?.text,
										ttl: rec?.elements[0]?.ttl ?? 3600,
										type: rec?.name === 'Nameserver' ? 'NS' : rec?.name,
									}
									result = [...result, insert]
								})
							}
							else {
								data?.map((rec) => {
									insert = {
										name: rec?.ame,
										data: rec?.elements[0]?.text,
										ttl: rec?.elements[0]?.ttl ?? 3600,
										type: rec?.name === 'Nameserver' ? 'NS' : rec?.name,
									}
									result = [...result, insert]
								})
							}
						}
					})
				}
			}
			else if (req === 'addRecord' && domain && body && body?.length > 0) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.dns.setHosts'
				let clientIP = `&ClientIp=${ip}`
				let props    = `&SLD=${domain.split(/\./)[0]}&TLD=${domain.replace(domain.split(/\./)[0]+'.', '')}`
				let records  = ''
				body?.map((rec, index) => {
					index++
					if ((rec?.type).toLowerCase() !== 'ns') {
						records += `&HostName${index}=${rec?.name}&RecordType${index}=${rec?.type}&Address${index}=${rec?.data}&TTL${index}=${rec?.ttl}`
					}
				})
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${props}${records}`
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
								if (res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text) {
									return result = {
										error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
									}
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
							return result = {
								returnedData: {
									name: body?.host,
									data: body?.answer,
									ttl: body?.ttl ?? 3600,
									type: body?.type,
								},
								success: 'Your new record has been successfully added.'
							}
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
						else {
							return result = {
								error: `You don't have any records to display for this domain.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'changeNS' && domain && body) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.dns.setCustom'
				let clientIP = `&ClientIp=${ip}`
				let props    = `&SLD=${domain.split(/\./)[0]}&TLD=${domain.replace(domain.split(/\./)[0]+'.', '')}`
				let ns       = `&NameServers=${body[0]},${body[1]}`
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${props}${ns}`
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
								if (res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text) {
									return result = {
										error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
									}
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
							return result = {
								returnedData: [body?.ns1, body?.ns2],
								success: 'Your nameserver has been successfully added, please delete the previous NameServers to prevent conflict.'
							}
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
						else {
							return result = {
								error: `You don't have any records to display for this domain.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please check you network, refrech ... and try again. Sometime if you are using Namecheap registrar the servers go down, and you must try multiple times.`
						}
					})
				}
			}
			else if (req === 'deleteRecordNS' && domain && body) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.ns.delete'
				let clientIP = `&ClientIp=${ip}`
				let props    = `&SLD=${domain.split(/\./)[0]}&TLD=${domain.replace(domain.split(/\./)[0]+'.', '')}`
				let ns       = `&NameServer=${body}`
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${props}${ns}`
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
								if (res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text) {
									return result = {
										error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
									}
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
							let p = domainInfo?.metadata?.nameServers.indexOf(5);
							if (p > -1) {
								domainInfo?.metadata?.nameServers.splice(p, 1)
							}
							return result = {
								returnedData: null,
								success: 'Your record has been successfully deleted, please refrech the page.'
							}
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
						else {
							return result = {
								error: `You don't have any records to display for this domain.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'deleteRecord' && domain && body) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.dns.delete'
				let clientIP = `&ClientIp=${ip}`
				let props    = `&SLD=${domain.split(/\./)[0]}&TLD=${domain.replace(domain.split(/\./)[0]+'.', '')}`
				let ns       = `&Id=${body?.id}&RecordType=${body?.type}`
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${props}${ns}`
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
								if (res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text) {
									return result = {
										error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
									}
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.IsSuccess === 'true') {
							return result = {
								returnedData: null,
								success: 'Your record has been successfully deleted.'
							}
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
						else {
							return result = {
								error: `You don't have any records to display for this domain.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please try again or contact support.`
						}
					})
				}
			}
			else if (req === 'resetNS' && domain) {
				let apiuser  = `apiuser=${api.registrar_secret}`
				let username = `&username=${api.registrar_secret}`
				let apikey   = `&apikey=${api.registrar_key}`
				let command  = '&Command=namecheap.domains.dns.setDefault'
				let clientIP = `&ClientIp=${ip}`
				let props    = `&SLD=${domain.split(/\./)[0]}&TLD=${domain.replace(domain.split(/\./)[0]+'.', '')}`
				url = `${base}/xml.response?${apiuser}${apikey}${username}${command}${clientIP}${props}`
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
								if (res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text) {
									return result = {
										error: `Wrong request: ${res?.elements[0]?.elements[0]?.elements[0]?.elements[0]?.text}`
									}
								}
							}
						}
						if (res?.elements[0]?.attributes.Status === 'OK' && res?.elements[0]?.elements[3]?.elements[0]?.attributes?.Updated === 'true') {
							result = {
								returnedData: null,
								success: 'Your nameservers has been successfully updated, please refrech the page to see the changes.'
							}
						}
						else if (res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text) {
							return result = {
								error: `Warning: ${res?.elements[0]?.elements[1]?.elements[0]?.elements[0]?.text}`
							}
						}
						else {
							return result = {
								error: `You don't have any records to display for this domain.`
							}
						}
					})
					.catch((err) => {
						return result = {
							error: `Wrong request, please check you network, refrech ... and try again. Sometime if you are using Namecheap registrar the servers go down, and you must try multiple times.`
						}
					})
				}
			}

		}

	}

	// console.log(result)
	return result
}

export default domainFire