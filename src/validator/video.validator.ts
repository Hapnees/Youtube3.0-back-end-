import { getExt } from '../utils/getExt.util'

export const videoValidator = (fileName: string) => {
	const ext = getExt(fileName)
	const correctExts = ['mp4', 'MP4']
	if (correctExts.includes(ext)) {
		return { status: true }
	}

	return { status: false, ext }
}
