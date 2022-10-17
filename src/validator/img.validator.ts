import { getExt } from '../utils/getExt.util'

export const imgValidator = (fileName: string) => {
	const ext = getExt(fileName)
	const correctExts = ['jpg', 'jpeg', 'png']
	if (correctExts.includes(ext)) {
		return { status: true }
	}

	return { status: false, ext }
}
