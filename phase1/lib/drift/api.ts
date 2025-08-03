/** Get User Position Details on Drift */
export async function getUserPositions(walletAddress:string) {
    try{
        const res = await fetch(`/api/drift?user=${walletAddress}`);
        const data:any = await res.json();
        console.log("User Positions Data:", data);
        return data;
    }catch(error){
        console.error('Error:', error);
    }
}