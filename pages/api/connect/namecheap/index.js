import { getData } from "@/utils/helpers"


const NamecheapApiFire = async (req, res) => {

	if (req.method === 'POST') {

		const { request } = await req.body

		if (request) {
			const r = await getData(request, null, 'text/xml', true)
			return res.status(200).json(r)
		}
		
	}
	else {
		res.setHeader('Allow', 'POST')
		return res.status(405).end('Method Not Allowed')
	}

	return res.status(200).json()
}
export default NamecheapApiFire