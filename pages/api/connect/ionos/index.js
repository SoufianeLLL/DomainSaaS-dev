import { sendXRequest } from "@/utils/helpers"


const GodaddyApiFire = async (req, res) => {

	const { request, authorization, method, data } = await req.body
	let r = null
	
	if (request && method) {
        r = await sendXRequest({
            url: request, 
            auth: authorization, 
            method,
            body: JSON.stringify(data) ?? null
        })
		return res.status(200).json(r)
	}
	
	return res.status(200).json()
}
export default GodaddyApiFire