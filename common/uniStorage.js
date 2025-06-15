import {API} from '@/common/config.js'

export function getMapintoCache(){
    if(uni.getStorageInfo())
        uni.request({
            url: API.ALL_MAPS,
            success:(res)=>{
                uni.setStorage({
                    key: "maps",
                    data: [...res.data.data]
                })
            }
        })
}
export function clearMapCache(){
    uni.removeStorage({key:"maps"})
}
