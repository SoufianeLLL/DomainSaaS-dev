import { sendXRequest } from "@/utils/helpers"


const GodaddyApiFire = async (req, res) => {

	const { request, method, data } = await req.body
	let r = null
	
	if (request && method) {
        r = await sendXRequest({
            url: request, 
            auth: null, 
            method,
            body: JSON.stringify(data) ?? null
        })
        console.log(r)
		return res.status(200).json(r)
	}
	
	return res.status(200).json()
}
export default GodaddyApiFire