export async function POST(request: Request) {
  try {
    const { ipfsHash } = await request.json();
    
    // 从 Pinata gateway 直接获取元数据
    const gatewayUrl = process.env.NEXT_PUBLIC_GATEKAY_URL || "gateway.pinata.cloud";
    const response = await fetch(`https://${gatewayUrl}/ipfs/${ipfsHash}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data = await response.json();
    return Response.json(data);
  } catch (error) {
    console.log("Error getting metadata from ipfs", error);
    return Response.json({ error: "Error getting metadata from ipfs" });
  }
}
