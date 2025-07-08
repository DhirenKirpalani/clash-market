// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useWallet } from "@/hooks/useWallet";
// import { useMatch } from "@/hooks/useMatch";
// import { useToast } from "@/hooks/use-toast";
// import { useState } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";

// // Invite Modal Component
// function InviteModal({ inviteCode, matchId, isOpen, onClose }: { inviteCode: string, matchId: string, isOpen: boolean, onClose: () => void }) {
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(inviteCode);
    
//     // Change button text temporarily to indicate copy was successful
//     const copyButton = document.getElementById('copy-invite-button');
//     if (copyButton) {
//       const originalText = copyButton.textContent;
//       copyButton.textContent = 'Copied!';
      
//       setTimeout(() => {
//         copyButton.textContent = originalText;
//       }, 2000);
//     }
//   };
  
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Invite Created</DialogTitle>
//           <DialogDescription>
//             Share this invite code with your friend to start a private match.
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="flex items-center space-x-2 my-4">
//           <div className="grid flex-1 gap-2">
//             <Label htmlFor="invite-code" className="sr-only">Invite Code</Label>
//             <Input
//               id="invite-code"
//               value={inviteCode}
//               readOnly
//               className="text-center text-lg font-bold tracking-wider"
//             />
//           </div>
//           <Button id="copy-invite-button" onClick={copyToClipboard} className="px-3">
//             <i className="ri-clipboard-line mr-2"></i>
//             Copy
//           </Button>
//         </div>
        
//         <div className="bg-neutral/10 p-4 rounded-lg space-y-3 my-2">
//           <h4 className="font-medium">Next Steps:</h4>
//           <ol className="list-decimal pl-5 space-y-2 text-sm">
//             <li>Share this code with your friend</li>
//             <li>Your friend needs to enter this code on their CryptoClash app</li>
//             <li>Once they join, the match will start automatically</li>
//             <li>The match will use {localStorage.getItem('preferredCurrencyPair') || "BTC/USDC"} with a duration of {localStorage.getItem('preferredDuration') || "30"} minutes</li>
//           </ol>
//         </div>
        
//         <DialogFooter className="sm:justify-center">
//           <Button onClick={onClose} variant="outline">
//             Close
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function MatchQueue() {
//   const { connected } = useWallet();
//   const { joinQueue, createFriendMatch } = useMatch();
//   const { toast } = useToast();
  
//   // Invite modal state
//   const [showInviteModal, setShowInviteModal] = useState(false);
//   const [currentInviteCode, setCurrentInviteCode] = useState("");
  
//   // Get saved preferences from localStorage or use defaults
//   const [currencyPair, setCurrencyPair] = useState(() => {
//     return localStorage.getItem('preferredCurrencyPair') || "BTC/USDC";
//   });
  
//   const [duration, setDuration] = useState(() => {
//     return localStorage.getItem('preferredDuration') || "30";
//   }); // in minutes
  
//   // Update localStorage when preferences change
//   const updateCurrencyPair = (value: string) => {
//     setCurrencyPair(value);
//     localStorage.setItem('preferredCurrencyPair', value);
//   };
  
//   const updateDuration = (value: string) => {
//     setDuration(value);
//     localStorage.setItem('preferredDuration', value);
//   };

//   const handleJoinQueue = async () => {
//     if (!connected) {
//       toast({
//         title: "Wallet Not Connected",
//         description: "Please connect your wallet to join a match",
//         variant: "destructive"
//       });
//       return;
//     }

//     try {
//       await joinQueue();
//       toast({
//         title: "Joined Queue",
//         description: "Looking for an opponent...",
//       });
//     } catch (error) {
//       toast({
//         title: "Failed to Join Queue",
//         description: error instanceof Error ? error.message : "Unknown error occurred",
//         variant: "destructive"
//       });
//     }
//   };

//   const handleCreateInvite = async () => {
//     if (!connected) {
//       toast({
//         title: "Wallet Not Connected",
//         description: "Please connect your wallet to create an invite",
//         variant: "destructive"
//       });
//       return;
//     }

//     try {
//       // Convert duration from minutes to seconds
//       const durationInSeconds = parseInt(duration) * 60;
      
//       // Pass currency pair and duration to the createFriendMatch function
//       const inviteCode = await createFriendMatch(currencyPair, durationInSeconds);
      
//       // Store the invite code and show the modal
//       setCurrentInviteCode(inviteCode);
//       setShowInviteModal(true);
      
//       // Still show a toast notification for awareness
//       toast({
//         title: "Invite Created",
//         description: "Match is ready! Share the invite code with your friend.",
//       });
//     } catch (error) {
//       toast({
//         title: "Failed to Create Invite",
//         description: error instanceof Error ? error.message : "Unknown error occurred",
//         variant: "destructive"
//       });
//     }
//   };

//   return (
//     <div className="mb-8">
//       {/* Invite Modal */}
//       <InviteModal 
//         inviteCode={currentInviteCode} 
//         isOpen={showInviteModal} 
//         onClose={() => setShowInviteModal(false)}
//       />
//       <h2 className="text-2xl font-manrope font-bold mb-4">Ready to Trade?</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {/* Quick Match Card */}
//         <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-accent-primary/50 transition-all">
//           <CardContent className="p-0">
//             <div className="flex justify-between items-start mb-4">
//               <div className="bg-accent-primary/20 p-2 rounded-lg">
//                 <i className="ri-sword-line text-xl text-accent-primary"></i>
//               </div>
//               <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full">Popular</span>
//             </div>
//             <h3 className="text-lg font-bold mb-1">Quick Match</h3>
//             <p className="text-text-secondary text-sm mb-4">Get matched with a random opponent and start trading instantly.</p>
//             <div className="flex items-center text-xs text-text-secondary mb-6">
//               <div className="flex items-center mr-4">
//                 <i className="ri-time-line mr-1"></i>
//                 <span>30 min</span>
//               </div>
//               <div className="flex items-center">
//                 <i className="ri-user-line mr-1"></i>
//                 <span>1v1</span>
//               </div>
//             </div>
//             <Button 
//               className="w-full py-2.5 px-4 bg-accent-primary text-bg-primary rounded-lg font-medium glow-button"
//               onClick={handleJoinQueue}
//             >
//               Join Queue
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Friend Match Card */}
//         <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-accent-secondary/50 transition-all">
//           <CardContent className="p-0">
//             <div className="flex justify-between items-start mb-4">
//               <div className="bg-accent-secondary/20 p-2 rounded-lg">
//                 <i className="ri-user-add-line text-xl text-accent-secondary"></i>
//               </div>
//             </div>
//             <h3 className="text-lg font-bold mb-1">Challenge a Friend</h3>
//             <p className="text-text-secondary text-sm mb-4">Invite a friend to a private trading match.</p>
            
//             <div className="space-y-4 mb-4">
//               <div>
//                 <Label htmlFor="currency-pair" className="text-sm">Currency Pair</Label>
//                 <Select 
//                   value={currencyPair} 
//                   onValueChange={updateCurrencyPair}
//                 >
//                   <SelectTrigger id="currency-pair" className="w-full mt-1">
//                     <SelectValue placeholder="Select a currency pair" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="BTC/USDC">BTC/USDC</SelectItem>
//                     <SelectItem value="ETH/USDC">ETH/USDC</SelectItem>
//                     <SelectItem value="SOL/USDC">SOL/USDC</SelectItem>
//                     <SelectItem value="ADA/USDC">ADA/USDC</SelectItem>
//                     <SelectItem value="XRP/USDC">XRP/USDC</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <div>
//                 <Label htmlFor="match-duration" className="text-sm">Match Duration</Label>
//                 <Select 
//                   value={duration} 
//                   onValueChange={updateDuration}
//                 >
//                   <SelectTrigger id="match-duration" className="w-full mt-1">
//                     <SelectValue placeholder="Select duration" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="15">15 Minutes</SelectItem>
//                     <SelectItem value="30">30 Minutes</SelectItem>
//                     <SelectItem value="60">60 Minutes</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
            
//             <div className="flex items-center text-xs text-text-secondary mb-4">
//               <div className="flex items-center mr-4">
//                 <i className="ri-time-line mr-1"></i>
//                 <span>{duration} min</span>
//               </div>
//               <div className="flex items-center">
//                 <i className="ri-user-line mr-1"></i>
//                 <span>1v1</span>
//               </div>
//             </div>
//             <Button 
//               className="w-full py-2.5 px-4 bg-accent-secondary/90 hover:bg-accent-secondary text-text-primary rounded-lg font-medium transition-colors"
//               onClick={handleCreateInvite}
//             >
//               Create Invite
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Tournament Card */}
//         <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-neutral/50 transition-all">
//           <CardContent className="p-0">
//             <div className="flex justify-between items-start mb-4">
//               <div className="bg-neutral/20 p-2 rounded-lg">
//                 <i className="ri-trophy-line text-xl text-neutral"></i>
//               </div>
//               <span className="bg-neutral/20 text-neutral text-xs px-2 py-1 rounded-full">Coming Soon</span>
//             </div>
//             <h3 className="text-lg font-bold mb-1">Tournament</h3>
//             <p className="text-text-secondary text-sm mb-4">Compete in bracket-style tournaments for bigger prizes.</p>
//             <div className="flex items-center text-xs text-text-secondary mb-6">
//               <div className="flex items-center mr-4">
//                 <i className="ri-time-line mr-1"></i>
//                 <span>Varies</span>
//               </div>
//               <div className="flex items-center">
//                 <i className="ri-team-line mr-1"></i>
//                 <span>8+ players</span>
//               </div>
//             </div>
//             <Button 
//               className="w-full py-2.5 px-4 bg-neutral/30 text-neutral cursor-not-allowed rounded-lg font-medium"
//               disabled
//             >
//               Coming Soon
//             </Button>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// }

// import { Card, CardContent } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { useWallet } from "@/hooks/useWallet";
// import { useMatch } from "@/hooks/useMatch";
// import { useToast } from "@/hooks/use-toast";
// import { useState } from "react";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Label } from "@/components/ui/label";
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Input } from "@/components/ui/input";

// // Invite Modal Component
// function InviteModal({ inviteCode, matchId, isOpen, onClose }: { inviteCode: string, matchId: string, isOpen: boolean, onClose: () => void }) {
//   const copyToClipboard = () => {
//     navigator.clipboard.writeText(inviteCode);
    
//     // Change button text temporarily to indicate copy was successful
//     const copyButton = document.getElementById('copy-invite-button');
//     if (copyButton) {
//       const originalText = copyButton.textContent;
//       copyButton.textContent = 'Copied!';
      
//       setTimeout(() => {
//         copyButton.textContent = originalText;
//       }, 2000);
//     }
//   };
  
//   return (
//     <Dialog open={isOpen} onOpenChange={onClose}>
//       <DialogContent className="sm:max-w-md">
//         <DialogHeader>
//           <DialogTitle>Invite Created</DialogTitle>
//           <DialogDescription>
//             Share this invite code with your friend to start a private match.
//           </DialogDescription>
//         </DialogHeader>
        
//         <div className="flex items-center space-x-2 my-4">
//           <div className="grid flex-1 gap-2">
//             <Label htmlFor="invite-code" className="sr-only">Invite Code</Label>
//             <Input
//               id="invite-code"
//               value={inviteCode}
//               readOnly
//               className="text-center text-lg font-bold tracking-wider"
//             />
//           </div>
//           <Button id="copy-invite-button" onClick={copyToClipboard} className="px-3">
//             <i className="ri-clipboard-line mr-2"></i>
//             Copy
//           </Button>
//         </div>
        
//         <div className="bg-neutral/10 p-4 rounded-lg space-y-3 my-2">
//           <h4 className="font-medium">Next Steps:</h4>
//           <ol className="list-decimal pl-5 space-y-2 text-sm">
//             <li>Share this code with your friend</li>
//             <li>Your friend needs to enter this code on their CryptoClash app</li>
//             <li>Once they join, the match will start automatically</li>
//             <li>The match will use {localStorage.getItem('preferredCurrencyPair') || "BTC/USDC"} with a duration of {localStorage.getItem('preferredDuration') || "30"} minutes</li>
//           </ol>
//         </div>
        
//         <DialogFooter className="sm:justify-center">
//           <Button onClick={onClose} variant="outline">
//             Close
//           </Button>
//         </DialogFooter>
//       </DialogContent>
//     </Dialog>
//   );
// }

// export default function MatchQueue() {
//   const { connected } = useWallet();
//   const { joinQueue, createFriendMatch, joinMatch } = useMatch();
//   const { toast } = useToast();
  
//   // Invite modal state
//   const [showInviteModal, setShowInviteModal] = useState(false);
//   const [currentInviteCode, setCurrentInviteCode] = useState("");
  
//   // Join with invite code state
//   const [joinInviteCode, setJoinInviteCode] = useState("");
//   const [isJoining, setIsJoining] = useState(false);
  
//   // Get saved preferences from localStorage or use defaults
//   const [currencyPair, setCurrencyPair] = useState(() => {
//     return localStorage.getItem('preferredCurrencyPair') || "BTC/USDC";
//   });
  
//   const [duration, setDuration] = useState(() => {
//     return localStorage.getItem('preferredDuration') || "30";
//   }); // in minutes
  
//   // Update localStorage when preferences change
//   const updateCurrencyPair = (value: string) => {
//     setCurrencyPair(value);
//     localStorage.setItem('preferredCurrencyPair', value);
//   };
  
//   const updateDuration = (value: string) => {
//     setDuration(value);
//     localStorage.setItem('preferredDuration', value);
//   };

//   const handleJoinQueue = async () => {
//     if (!connected) {
//       toast({
//         title: "Wallet Not Connected",
//         description: "Please connect your wallet to join a match",
//         variant: "destructive"
//       });
//       return;
//     }

//     try {
//       await joinQueue();
//       toast({
//         title: "Joined Queue",
//         description: "Looking for an opponent...",
//       });
//     } catch (error) {
//       toast({
//         title: "Failed to Join Queue",
//         description: error instanceof Error ? error.message : "Unknown error occurred",
//         variant: "destructive"
//       });
//     }
//   };

//   // Handle joining a match with an invite code
//   const handleJoinWithInviteCode = async () => {
//     if (!connected) {
//       toast({
//         title: "Wallet Not Connected",
//         description: "Please connect your wallet to join a match",
//         variant: "destructive"
//       });
//       return;
//     }
    
//     if (!joinInviteCode.trim()) {
//       toast({
//         title: "Missing Invite Code",
//         description: "Please enter an invite code to join",
//         variant: "destructive"
//       });
//       return;
//     }
    
//     try {
//       setIsJoining(true);
//       await joinMatch(joinInviteCode.trim());
      
//       toast({
//         title: "Joining Match",
//         description: "Connecting to match...",
//       });
      
//       // Clear the form
//       setJoinInviteCode("");
//     } catch (error) {
//       toast({
//         title: "Failed to Join Match",
//         description: error instanceof Error ? error.message : "Unknown error occurred",
//         variant: "destructive"
//       });
//     } finally {
//       setIsJoining(false);
//     }
//   };
  
//   const handleCreateInvite = async () => {
//     if (!connected) {
//       toast({
//         title: "Wallet Not Connected",
//         description: "Please connect your wallet to create an invite",
//         variant: "destructive"
//       });
//       return;
//     }

//     try {
//       // Convert duration from minutes to seconds
//       const durationInSeconds = parseInt(duration) * 60;
      
//       // Pass currency pair and duration to the createFriendMatch function
//       const inviteCode = await createFriendMatch(currencyPair, durationInSeconds);
      
//       // Store the invite code and show the modal
//       setCurrentInviteCode(inviteCode);
//       setShowInviteModal(true);
      
//       // Still show a toast notification for awareness
//       toast({
//         title: "Invite Created",
//         description: "Match is ready! Share the invite code with your friend.",
//       });
//     } catch (error) {
//       toast({
//         title: "Failed to Create Invite",
//         description: error instanceof Error ? error.message : "Unknown error occurred",
//         variant: "destructive"
//       });
//     }
//   };

//   return (
//     <div className="mb-8">
//       {/* Invite Modal */}
//       <InviteModal 
//         inviteCode={currentInviteCode} 
//         isOpen={showInviteModal} 
//         onClose={() => setShowInviteModal(false)}
//       />
//       <h2 className="text-2xl font-manrope font-bold mb-4">Ready to Trade?</h2>
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
//         {/* Quick Match Card */}
//         <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-accent-primary/50 transition-all">
//           <CardContent className="p-0">
//             <div className="flex justify-between items-start mb-4">
//               <div className="bg-accent-primary/20 p-2 rounded-lg">
//                 <i className="ri-sword-line text-xl text-accent-primary"></i>
//               </div>
//               <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full">Popular</span>
//             </div>
//             <h3 className="text-lg font-bold mb-1">Quick Match</h3>
//             <p className="text-text-secondary text-sm mb-4">Get matched with a random opponent and start trading instantly.</p>
//             <div className="flex items-center text-xs text-text-secondary mb-6">
//               <div className="flex items-center mr-4">
//                 <i className="ri-time-line mr-1"></i>
//                 <span>30 min</span>
//               </div>
//               <div className="flex items-center">
//                 <i className="ri-user-line mr-1"></i>
//                 <span>1v1</span>
//               </div>
//             </div>
//             <Button 
//               className="w-full py-2.5 px-4 bg-accent-primary text-bg-primary rounded-lg font-medium glow-button"
//               onClick={handleJoinQueue}
//             >
//               Join Queue
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Friend Match Card */}
//         <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-accent-secondary/50 transition-all">
//           <CardContent className="p-0">
//             <div className="flex justify-between items-start mb-4">
//               <div className="bg-accent-secondary/20 p-2 rounded-lg">
//                 <i className="ri-user-add-line text-xl text-accent-secondary"></i>
//               </div>
//             </div>
//             <h3 className="text-lg font-bold mb-1">Challenge a Friend</h3>
//             <p className="text-text-secondary text-sm mb-4">Invite a friend to a private trading match.</p>
            
//             <div className="space-y-4 mb-4">
//               <div>
//                 <Label htmlFor="currency-pair" className="text-sm">Currency Pair</Label>
//                 <Select 
//                   value={currencyPair} 
//                   onValueChange={updateCurrencyPair}
//                 >
//                   <SelectTrigger id="currency-pair" className="w-full mt-1">
//                     <SelectValue placeholder="Select a currency pair" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="BTC/USDC">BTC/USDC</SelectItem>
//                     <SelectItem value="ETH/USDC">ETH/USDC</SelectItem>
//                     <SelectItem value="SOL/USDC">SOL/USDC</SelectItem>
//                     <SelectItem value="ADA/USDC">ADA/USDC</SelectItem>
//                     <SelectItem value="XRP/USDC">XRP/USDC</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
              
//               <div>
//                 <Label htmlFor="match-duration" className="text-sm">Match Duration</Label>
//                 <Select 
//                   value={duration} 
//                   onValueChange={updateDuration}
//                 >
//                   <SelectTrigger id="match-duration" className="w-full mt-1">
//                     <SelectValue placeholder="Select duration" />
//                   </SelectTrigger>
//                   <SelectContent>
//                     <SelectItem value="15">15 Minutes</SelectItem>
//                     <SelectItem value="30">30 Minutes</SelectItem>
//                     <SelectItem value="60">60 Minutes</SelectItem>
//                   </SelectContent>
//                 </Select>
//               </div>
//             </div>
            
//             <div className="flex items-center text-xs text-text-secondary mb-4">
//               <div className="flex items-center mr-4">
//                 <i className="ri-time-line mr-1"></i>
//                 <span>{duration} min</span>
//               </div>
//               <div className="flex items-center">
//                 <i className="ri-user-line mr-1"></i>
//                 <span>1v1</span>
//               </div>
//             </div>
//             <Button 
//               className="w-full py-2.5 px-4 bg-accent-secondary/90 hover:bg-accent-secondary text-text-primary rounded-lg font-medium transition-colors"
//               onClick={handleCreateInvite}
//             >
//               Create Invite
//             </Button>
//           </CardContent>
//         </Card>

//         {/* Tournament Card */}
//         <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-neutral/50 transition-all">
//           <CardContent className="p-0">
//             <div className="flex justify-between items-start mb-4">
//               <div className="bg-neutral/20 p-2 rounded-lg">
//                 <i className="ri-trophy-line text-xl text-neutral"></i>
//               </div>
//               <span className="bg-neutral/20 text-neutral text-xs px-2 py-1 rounded-full">Coming Soon</span>
//             </div>
//             <h3 className="text-lg font-bold mb-1">Tournament</h3>
//             <p className="text-text-secondary text-sm mb-4">Compete in bracket-style tournaments for bigger prizes.</p>
//             <div className="flex items-center text-xs text-text-secondary mb-6">
//               <div className="flex items-center mr-4">
//                 <i className="ri-time-line mr-1"></i>
//                 <span>Varies</span>
//               </div>
//               <div className="flex items-center">
//                 <i className="ri-team-line mr-1"></i>
//                 <span>8+ players</span>
//               </div>
//             </div>
//             <Button 
//               className="w-full py-2.5 px-4 bg-neutral/30 text-neutral cursor-not-allowed rounded-lg font-medium"
//               disabled
//             >
//               Coming Soon
//             </Button>
//           </CardContent>
//         </Card>
        
//         {/* Join with Invite Code Section */}
//         <div className="mt-8">
//           <h2 className="text-2xl font-manrope font-bold mb-4">Join with Invite Code</h2>
//           <Card className="gradient-card rounded-xl p-5 border border-neutral/20 transition-all">
//             <CardContent className="p-0">
//               <div className="flex justify-between items-start mb-4">
//                 <div className="bg-accent-primary/20 p-2 rounded-lg">
//                   <i className="ri-link-m text-xl text-accent-primary"></i>
//                 </div>
//               </div>
//               <h3 className="text-lg font-bold mb-1">Enter Invite Code</h3>
//               <p className="text-text-secondary text-sm mb-4">Paste the invite code shared with you to join a friend's match.</p>
              
//               <div className="flex space-x-2 mb-4">
//                 <Input
//                   placeholder="Enter invite code here"
//                   value={joinInviteCode}
//                   onChange={(e) => setJoinInviteCode(e.target.value)}
//                   className="flex-1"
//                 />
//                 <Button 
//                   onClick={handleJoinWithInviteCode}
//                   disabled={isJoining || !joinInviteCode.trim()}
//                   className="whitespace-nowrap"
//                 >
//                   {isJoining ? (
//                     <>
//                       <i className="ri-loader-4-line animate-spin mr-2"></i>
//                       Joining...
//                     </>
//                   ) : (
//                     <>Join Match</>
//                   )}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         </div>
//       </div>
//     </div>
//   );
// }

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/hooks/useWallet";
import { useMatch } from "@/hooks/useMatch";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

// Invite Modal Component
function InviteModal({ inviteCode, matchId, isOpen, onClose }: { inviteCode: string, matchId: string, isOpen: boolean, onClose: () => void }) {
  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteCode);
    
    // Change button text temporarily to indicate copy was successful
    const copyButton = document.getElementById('copy-invite-button');
    if (copyButton) {
      const originalText = copyButton.textContent;
      copyButton.textContent = 'Copied!';
      
      setTimeout(() => {
        copyButton.textContent = originalText;
      }, 2000);
    }
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite Created</DialogTitle>
          <DialogDescription>
            Share this invite code with your friend to start a private match.
          </DialogDescription>
        </DialogHeader>
        
        <div className="flex items-center space-x-2 my-4">
          <div className="grid flex-1 gap-2">
            <Label htmlFor="invite-code" className="sr-only">Invite Code</Label>
            <Input
              id="invite-code"
              value={inviteCode}
              readOnly
              className="text-center text-lg font-bold tracking-wider"
            />
          </div>
          <Button id="copy-invite-button" onClick={copyToClipboard} className="px-3">
            <i className="ri-clipboard-line mr-2"></i>
            Copy
          </Button>
        </div>
        
        <div className="bg-neutral/10 p-4 rounded-lg space-y-3 my-2">
          <h4 className="font-medium">Next Steps:</h4>
          <ol className="list-decimal pl-5 space-y-2 text-sm">
            <li>Share this code with your friend</li>
            <li>Your friend needs to enter this code on their CryptoClash app</li>
            <li>Once they join, the match will start automatically</li>
            <li>The match will use {localStorage.getItem('preferredCurrencyPair') || "BTC/USDC"} with a duration of {localStorage.getItem('preferredDuration') || "30"} minutes</li>
          </ol>
        </div>
        
        <DialogFooter className="sm:justify-start space-x-2">
          <Button onClick={onClose} variant="outline" className="w-1/2">
            Close
          </Button>
          <Button 
            onClick={() => {
              onClose();
              // Store the match ID in localStorage directly
              try {
                const minimalMatch = {
                  id: matchId,
                  status: 'pending',
                  createdAt: new Date().toISOString(),
                };
                
                console.log('Storing minimal match data in localStorage:', minimalMatch);
                localStorage.setItem('activeMatchData', JSON.stringify(minimalMatch));
              } catch (e) {
                console.error('Error handling localStorage for match data:', e);
              }
              
              // Navigate to match page with matchId
              window.location.href = `/match/${matchId}`;
            }}
            className="w-1/2 bg-accent-primary hover:bg-accent-primary/80"
          >
            Go to Match
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function MatchQueue() {
  const { connected } = useWallet();
  const { joinQueue, createFriendMatch, joinMatch, activeMatch } = useMatch();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  
  // Invite modal state
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [currentInviteCode, setCurrentInviteCode] = useState("");
  const [currentMatchId, setCurrentMatchId] = useState("");
  
  // Join with invite code state
  const [joinInviteCode, setJoinInviteCode] = useState("");
  const [isJoining, setIsJoining] = useState(false);
  
  // Redirect to match page when activeMatch becomes available
  useEffect(() => {
    if (activeMatch) {
      // Redirect to match page
      setLocation("/match");
    }
  }, [activeMatch, setLocation]);
  
  // Get saved preferences from localStorage or use defaults
  const [currencyPair, setCurrencyPair] = useState(() => {
    return localStorage.getItem('preferredCurrencyPair') || "BTC/USDC";
  });
  
  const [duration, setDuration] = useState(() => {
    return localStorage.getItem('preferredDuration') || "30";
  }); // in minutes
  
  // Update localStorage when preferences change
  const updateCurrencyPair = (value: string) => {
    setCurrencyPair(value);
    localStorage.setItem('preferredCurrencyPair', value);
  };
  
  const updateDuration = (value: string) => {
    setDuration(value);
    localStorage.setItem('preferredDuration', value);
  };

  const handleJoinQueue = async () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to join a match",
        variant: "destructive"
      });
      return;
    }

    try {
      await joinQueue();
      toast({
        title: "Joined Queue",
        description: "Looking for an opponent...",
      });
    } catch (error) {
      toast({
        title: "Failed to Join Queue",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  // Handle joining a match with an invite code
  const handleJoinWithInviteCode = async () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to join a match",
        variant: "destructive"
      });
      return;
    }
    
    if (!joinInviteCode.trim()) {
      toast({
        title: "Missing Invite Code",
        description: "Please enter an invite code to join",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsJoining(true);
      
      // Get the match status first
      const lookupResponse = await fetch(`/api/matches/code/${joinInviteCode.trim()}`);
      const lookupData = await lookupResponse.json();
      
      if (!lookupData.matchId) {
        throw new Error('Invalid invite code');
      }
      
      // Join the match
      await joinMatch(joinInviteCode.trim());
      
      // Clear the form
      setJoinInviteCode("");
      
      if (lookupData.status === 'pending') {
        // This is the second player joining, both can now be redirected
        toast({
          title: "Match Starting",
          description: "Both players have joined. Starting match...",
        });
        
        // Allow a moment for the WebSocket event to be processed
        setTimeout(() => {
          window.location.href = "/match";
        }, 1000);
      } else {
        // This is the first player creating the match
        toast({
          title: "Waiting for Opponent",
          description: "Match created. Waiting for your opponent to join...",
        });
      }
      
    } catch (error) {
      toast({
        title: "Failed to Join Match",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    } finally {
      setIsJoining(false);
    }
  };
  
  const handleCreateInvite = async () => {
    if (!connected) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet to create an invite",
        variant: "destructive"
      });
      return;
    }

    try {
      console.log('Creating friend match with currency pair:', currencyPair, 'and duration:', duration);
      
      // Convert duration from minutes to seconds
      const durationInSeconds = parseInt(duration) * 60;
      
      // Pass currency pair and duration to the createFriendMatch function
      const result = await createFriendMatch(currencyPair, durationInSeconds);
      console.log('Friend match created with result:', result);
      
      // Extract invite code and match ID from the result
      const inviteCode = typeof result === 'object' ? result.inviteCode : result;
      const matchId = typeof result === 'object' ? result.matchId : null;
      
      if (!inviteCode) {
        throw new Error('Failed to get invite code from created match');
      }
      
      console.log('Setting current invite code:', inviteCode, 'and match ID:', matchId);
      
      // Store the invite code and match ID
      setCurrentInviteCode(inviteCode);
      if (matchId) {
        setCurrentMatchId(matchId);
        
        // Create a minimal match object to store in localStorage
        const minimalMatch = {
          id: matchId,
          status: 'pending',
          createdAt: new Date().toISOString(),
          currencyPair,
          durationSeconds: durationInSeconds
        };
        
        console.log('Storing minimal match data in localStorage:', minimalMatch);
        localStorage.setItem('activeMatchData', JSON.stringify(minimalMatch));
      }
      
      // Show the invite modal
      setShowInviteModal(true);
      
      toast({
        title: "Invite Created",
        description: "Match is ready! Share the invite code with your friend.",
      });
      
      // Start polling for match status changes
      let pollCount = 0;
      const maxPolls = 30; // 30 * 2s = 60 seconds max polling time
      
      const pollInterval = setInterval(async () => {
        try {
          pollCount++;
          console.log(`Polling match status for invite ${inviteCode}, attempt ${pollCount}`);
          
          // Check if match is active
          const response = await fetch(`/api/matches/code/${inviteCode}`);
          const data = await response.json();
          
          if (data.status === 'active') {
            // Match is now active, both players have joined
            clearInterval(pollInterval);
            console.log('Match is now active, redirecting to match page');
            
            toast({
              title: "Match Starting",
              description: "Your opponent has joined! Starting match...",
            });
            
            // Redirect to match page
            setTimeout(() => {
              window.location.href = '/match';
            }, 1000);
          }
          
          // Stop polling after max attempts
          if (pollCount >= maxPolls) {
            clearInterval(pollInterval);
            console.log('Stopped polling after max attempts');
          }
        } catch (error) {
          console.error('Error polling match status:', error);
          clearInterval(pollInterval);
        }
      }, 2000); // Poll every 2 seconds
      
    } catch (error) {
      toast({
        title: "Failed to Create Invite",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="mb-8">
      {/* Invite Modal */}
      <InviteModal 
        inviteCode={currentInviteCode}
        matchId={currentMatchId}
        isOpen={showInviteModal} 
        onClose={() => setShowInviteModal(false)}
      />
      <h2 className="text-2xl font-manrope font-bold mb-4">Ready to Trade?</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Quick Match Card */}
        <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-accent-primary/50 transition-all">
          <CardContent className="p-0">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-accent-primary/20 p-2 rounded-lg">
                <i className="ri-sword-line text-xl text-accent-primary"></i>
              </div>
              <span className="bg-accent-primary/20 text-accent-primary text-xs px-2 py-1 rounded-full">Popular</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Quick Match</h3>
            <p className="text-text-secondary text-sm mb-4">Get matched with a random opponent and start trading instantly.</p>
            <div className="flex items-center text-xs text-text-secondary mb-6">
              <div className="flex items-center mr-4">
                <i className="ri-time-line mr-1"></i>
                <span>30 min</span>
              </div>
              <div className="flex items-center">
                <i className="ri-user-line mr-1"></i>
                <span>1v1</span>
              </div>
            </div>
            <Button 
              className="w-full py-2.5 px-4 bg-accent-primary text-bg-primary rounded-lg font-medium glow-button"
              onClick={handleJoinQueue}
            >
              Join Queue
            </Button>
          </CardContent>
        </Card>

        {/* Friend Match Card */}
        <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-accent-secondary/50 transition-all">
          <CardContent className="p-0">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-accent-secondary/20 p-2 rounded-lg">
                <i className="ri-user-add-line text-xl text-accent-secondary"></i>
              </div>
            </div>
            <h3 className="text-lg font-bold mb-1">Challenge a Friend</h3>
            <p className="text-text-secondary text-sm mb-4">Invite a friend to a private trading match.</p>
            
            <div className="space-y-4 mb-4">
              <div>
                <Label htmlFor="currency-pair" className="text-sm">Currency Pair</Label>
                <Select 
                  value={currencyPair} 
                  onValueChange={updateCurrencyPair}
                >
                  <SelectTrigger id="currency-pair" className="w-full mt-1">
                    <SelectValue placeholder="Select a currency pair" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BTC/USDC">BTC/USDC</SelectItem>
                    <SelectItem value="ETH/USDC">ETH/USDC</SelectItem>
                    <SelectItem value="SOL/USDC">SOL/USDC</SelectItem>
                    <SelectItem value="ADA/USDC">ADA/USDC</SelectItem>
                    <SelectItem value="XRP/USDC">XRP/USDC</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="match-duration" className="text-sm">Match Duration</Label>
                <Select 
                  value={duration} 
                  onValueChange={updateDuration}
                >
                  <SelectTrigger id="match-duration" className="w-full mt-1">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 Minutes</SelectItem>
                    <SelectItem value="30">30 Minutes</SelectItem>
                    <SelectItem value="60">60 Minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="flex items-center text-xs text-text-secondary mb-4">
              <div className="flex items-center mr-4">
                <i className="ri-time-line mr-1"></i>
                <span>{duration} min</span>
              </div>
              <div className="flex items-center">
                <i className="ri-user-line mr-1"></i>
                <span>1v1</span>
              </div>
            </div>
            <Button 
              className="w-full py-2.5 px-4 bg-accent-secondary/90 hover:bg-accent-secondary text-text-primary rounded-lg font-medium transition-colors"
              onClick={handleCreateInvite}
            >
              Create Invite
            </Button>
          </CardContent>
        </Card>

        {/* Tournament Card */}
        <Card className="gradient-card rounded-xl p-5 border border-neutral/20 hover:border-neutral/50 transition-all">
          <CardContent className="p-0">
            <div className="flex justify-between items-start mb-4">
              <div className="bg-neutral/20 p-2 rounded-lg">
                <i className="ri-trophy-line text-xl text-neutral"></i>
              </div>
              <span className="bg-neutral/20 text-neutral text-xs px-2 py-1 rounded-full">Coming Soon</span>
            </div>
            <h3 className="text-lg font-bold mb-1">Tournament</h3>
            <p className="text-text-secondary text-sm mb-4">Compete in bracket-style tournaments for bigger prizes.</p>
            <div className="flex items-center text-xs text-text-secondary mb-6">
              <div className="flex items-center mr-4">
                <i className="ri-time-line mr-1"></i>
                <span>Varies</span>
              </div>
              <div className="flex items-center">
                <i className="ri-team-line mr-1"></i>
                <span>8+ players</span>
              </div>
            </div>
            <Button 
              className="w-full py-2.5 px-4 bg-neutral/30 text-neutral cursor-not-allowed rounded-lg font-medium"
              disabled
            >
              Coming Soon
            </Button>
          </CardContent>
        </Card>
        
        {/* Join with Invite Code Section */}
        <div className="mt-8">
          <h2 className="text-2xl font-manrope font-bold mb-4">Join with Invite Code</h2>
          <Card className="gradient-card rounded-xl p-5 border border-neutral/20 transition-all">
            <CardContent className="p-0">
              <div className="flex justify-between items-start mb-4">
                <div className="bg-accent-primary/20 p-2 rounded-lg">
                  <i className="ri-link-m text-xl text-accent-primary"></i>
                </div>
              </div>
              <h3 className="text-lg font-bold mb-1">Enter Invite Code</h3>
              <p className="text-text-secondary text-sm mb-4">Paste the invite code shared with you to join a friend's match.</p>
              
              <div className="flex space-x-2 mb-4">
                <Input
                  placeholder="Enter invite code here"
                  value={joinInviteCode}
                  onChange={(e) => setJoinInviteCode(e.target.value)}
                  className="flex-1"
                />
                <Button 
                  onClick={handleJoinWithInviteCode}
                  disabled={isJoining || !joinInviteCode.trim()}
                  className="whitespace-nowrap"
                >
                  {isJoining ? (
                    <>
                      <i className="ri-loader-4-line animate-spin mr-2"></i>
                      Joining...
                    </>
                  ) : (
                    <>Join Match</>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}




