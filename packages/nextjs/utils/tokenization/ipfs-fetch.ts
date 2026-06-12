const fetchFromApi = ({ path, method, body }: { path: string; method: string; body?: object }) => {
  return fetch(path, {
    method,
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  })
    .then(response => response.json())
    .catch(error => console.error("Error:", error));
};

export const addToIPFS = (yourJSON: object) =>
  fetchFromApi({ path: "/api/ipfs/add", method: "Post", body: yourJSON }).then((res: any) => {
    return { IpfsHash: res?.IpfsHash || res?.path || res?.Hash };
  });

// 从 IPFS 获取 NFT 元数据
// 支持两种方式：
// 1. 传入 IPFS Hash → POST /api/ipfs/get-metadata → 从 Pinata gateway 获取
// 2. 传入完整 URL → 直接 fetch（兼容不同 gateway）
export const getMetadataFromIPFS = async (ipfsHash: string) => {
  try {
    // 如果传入的是完整 URL，直接 fetch
    if (ipfsHash.startsWith("http://") || ipfsHash.startsWith("https://")) {
      const response = await fetch(ipfsHash);
      if (!response.ok) {
        throw new Error(`HTTP error! status:${response.status}`);
      }
      const data = await response.json();
      return data;
    }

    // 否则走 API route
    const data = await fetchFromApi({
      path: "/api/ipfs/get-metadata",
      method: "Post",
      body: { ipfsHash },
    });
    return data;
  } catch (error) {
    console.error("Error fetching data from IPFS:", error);
    throw error;
  }
};

// 上传图片到 IPFS 并获取 CID
export async function uploadImageToIPFS(imageFile: File): Promise<string> {
  try {
    const formData = new FormData();
    formData.append("file", imageFile);

    const response = await fetch("/api/ipfs/addimg", {
      method: "POST",
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.IpfsHash;
  } catch (error) {
    console.error('Error uploading image to IPFS:', error);
    throw error;
  }
}
