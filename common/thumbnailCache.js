import { API } from '@/common/config.js';
export default {
    methods: {
        saveThunmbnailImageToLocal(map_name) {
            // 1️⃣下载图片到临时文件
            uni.downloadFile({
                url: API.THUMBNAIL_MAP + `/${map_name}.jpg`,
                success: (res) => {
                    if (res.statusCode === 200) {
                        console.log('下载成功，临时文件为：', res.tempFilePath);

                        // 2️⃣保存到本地
                        uni.saveFile({
                            tempFilePath: res.tempFilePath,
                            success: (resSave) => {
                                console.log('保存到本地成功!', resSave.savedFilePath);
                                // resSave.savedFilePath 就是保存到本地的路径，你可以重复利用
                            },
                            fail: (errSave) => {
                                console.error('保存失败!', errSave);
                            }
                        });
                    } else {
                        console.error('下载失败!', res);
                    }
                },
                fail: (err) => {
                    console.error('下载失败!', err);
                },
            });
        },
        // 获取已保存文件
        getSavedFiles(){
            uni.getSavedFileList({
                success: (res) => {
                    console.log('已保存文件!', res.fileList);
                },
                fail: (err) => {
                    console.error('获取失败!', err);
                },
            });
        },
        // 删除指定文件
        deleteFile(filePath){
            uni.removeSavedFile({
                filePath,
                success: (res) => {
                    console.log('删除成功!', res);
                },
                fail: (err) => {
                    console.error('删除失败!', err);
                },
            });
        },
    },
}
