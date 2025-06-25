import {API} from '@/common/config.js'

function getMapintoCache(){
    if(uni.getStorageInfo())
        uni.request({
            url: API.ALL_MAPS,
            success:(res)=>{
                uni.setStorage({
                    key: "maps",
                    data: [...res.data.data]
                })
            },
            fail: getMapintoCache
        })
}
function clearMapCache(){
    uni.removeStorage({key:"maps"})
}

function getCatalogsCache(){
    if(uni.getStorageInfo())
        uni.request({
            url: API.CATALOGS,
            success:(res)=>{
                uni.setStorage({
                    key: "catalogs",
                    data: [...res.data.data]
                })
            },
            fail: getCatalogsCache
        })
}

function clearCatalogsCache(){
    uni.removeStorage({key:"catalogs"})
}

export {getMapintoCache, clearMapCache, getCatalogsCache, clearCatalogsCache}