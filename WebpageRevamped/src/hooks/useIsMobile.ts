import { useState, useEffect } from 'react';
import { mobileWidth } from '../RnBenchmarkingWebPage.constant';

export const useIsMobile = () => {
    const [isMobile, setIsMobile] = useState<boolean>(window.innerWidth <= mobileWidth);

    const handleWindowSizeChange = () => {
        setIsMobile(window.innerWidth <= mobileWidth);
    };

    useEffect(() => {
        window.addEventListener('resize', handleWindowSizeChange);
        return () => {
            window.removeEventListener('resize', handleWindowSizeChange);
        };
    }, []);

    return isMobile;
};
