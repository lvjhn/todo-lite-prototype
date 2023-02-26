import { onClient } from '@/helpers/on-client'

console.log("Hello! - from main.js")

onClient(() => {
    const handleWheel = function(e) {
        if(e.ctrlKey || e.metaKey)
            e.preventDefault();
    };
    window.addEventListener("wheel", handleWheel, {passive: false});
});
