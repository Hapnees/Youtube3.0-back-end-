export const getExt = (fileName: string) => {
	const array = fileName.split('.')
	const ext = array[array.length - 1]

	return ext
}
