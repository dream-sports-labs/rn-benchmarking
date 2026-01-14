import RNFS from 'react-native-fs';
import { useEffect, useState } from 'react';

export function useCachedImage(base64: string) {
  const [uri, setUri] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    (async () => {
      // store it once
      const path = `${RNFS.CachesDirectoryPath}/once.jpg`;
      const exists = await RNFS.exists(path);
      if (!exists) await RNFS.writeFile(path, base64, 'base64');
      if (isMounted) setUri('file://' + path);
    })();
    return () => { isMounted = false };
  }, [base64]);

  return uri;
}