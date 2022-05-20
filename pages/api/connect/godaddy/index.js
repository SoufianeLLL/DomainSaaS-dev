import { getData, postData } from "@/utils/helpers"


const GodaddyApiFire = async (req, res) => {

	const { request, authorization, method, data } = await req.body
	let r = null

	
	if (request && method) {
		if (method !== 'GET') {
			r = await postData({
				url: request, 
				token: null, 
				data, 
				auth: authorization, 
				method
			})
		}
		else {
			r = await getData(request, authorization, 'application/json')
		}
		if (r) {
			return res.status(200).json(r)
		}
		else {
			return res.status(200).json({
				result: null
			})
		}
	}
	
	return res.status(200).json()
}
export default GodaddyApiFire