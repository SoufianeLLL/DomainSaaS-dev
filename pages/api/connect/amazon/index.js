import { Route53DomainsClient, ListDomainsCommand } from "@aws-sdk/client-route-53-domains"
const client = new Route53DomainsClient(credentials)


const GodaddyApiFire = async (req, res) => {

	const { credentials, command } = await req.body
	let r, cmd

	
	if (credentials && command) {
		switch (command) {
			case 'ListDomainsCommand':
				cmd = new ListDomainsCommand({ MaxItems: 1000 })
				break;
		}

		if (cmd) {
			r = await client.send(cmd)
				.then((res) => {
					console.log(res)
				})
				.catch((err) => {
					console.log(err)
				})
		}

		return res.status(200).json(r)
	}
	
	return res.status(200).json()
}
export default GodaddyApiFire