"use client";

import { useState, useEffect } from "react";
import { useAccount } from "wagmi";
import { notification } from "~~/utils/scaffold-eth";
import { Address } from "@scaffold-ui/components";
import type { NextPage } from "next";

interface UserProfileData {
  nickname: string;
  withdrawalAddress: string;
  walletAddress: string;
  bio: string;
}

const STORAGE_KEY = "barfi_user_profile";

const defaultProfile = (walletAddress: string): UserProfileData => ({
  nickname: "",
  withdrawalAddress: "",
  walletAddress,
  bio: "",
});

const Profile: NextPage = () => {
  const { address: connectedAddress, isConnected } = useAccount();
  const [profile, setProfile] = useState<UserProfileData | null>(null);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState<UserProfileData>(defaultProfile(""));

  useEffect(() => {
    if (!connectedAddress) return;
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed: UserProfileData = JSON.parse(saved);
        setProfile(parsed);
        setFormData(parsed);
        return;
      }
    } catch {
      // ignore corrupt data
    }
    const init = defaultProfile(connectedAddress);
    setProfile(init);
    setFormData(init);
  }, [connectedAddress]);

  const handleSave = () => {
    if (!connectedAddress) {
      notification.error("Please connect your wallet first");
      return;
    }
    const updated: UserProfileData = {
      ...formData,
      walletAddress: connectedAddress,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    setProfile(updated);
    setEditing(false);
    notification.success("Profile saved");
  };

  const handleCancel = () => {
    if (profile) setFormData(profile);
    setEditing(false);
  };

  if (!isConnected) {
    return (
      <div className="flex items-center flex-col flex-grow pt-10">
        <h1 className="text-center mb-8">
          <span className="block text-4xl font-bold">Profile</span>
        </h1>
        <div className="text-2xl text-primary-content mt-10">Please connect your wallet</div>
      </div>
    );
  }

  return (
    <div className="flex items-center flex-col flex-grow pt-10">
      <h1 className="text-center mb-8">
        <span className="block text-4xl font-bold">Profile</span>
      </h1>

      <div className="w-full max-w-lg bg-base-200 rounded-xl p-6 space-y-4">
        {/* Wallet Address - always visible */}
        <div>
          <label className="label"><span className="label-text font-semibold">Wallet Address</span></label>
          <Address address={connectedAddress as `0x${string}`} />
        </div>

        {editing ? (
          <>
            <div>
              <label className="label"><span className="label-text font-semibold">Nickname</span></label>
              <input
                type="text"
                placeholder="Enter nickname"
                value={formData.nickname}
                onChange={e => setFormData({ ...formData, nickname: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label"><span className="label-text font-semibold">withdrawalAddress</span></label>
              <input
                type="withdrawalAddress"
                placeholder="Enter place"
                value={formData.withdrawalAddress}
                onChange={e => setFormData({ ...formData, withdrawalAddress: e.target.value })}
                className="input input-bordered w-full"
              />
            </div>
            <div>
              <label className="label"><span className="label-text font-semibold">Bio</span></label>
              <textarea
                placeholder="Write a short bio..."
                value={formData.bio}
                onChange={e => setFormData({ ...formData, bio: e.target.value })}
                className="textarea textarea-bordered w-full"
                rows={3}
              />
            </div>
            <div className="flex gap-3 justify-end">
              <button className="btn btn-ghost" onClick={handleCancel}>Cancel</button>
              <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>
          </>
        ) : (
          <>
            <div>
              <label className="label"><span className="label-text font-semibold">Nickname</span></label>
              <p className="text-lg">{profile?.nickname || "Not set"}</p>
            </div>
            <div>
              <label className="label"><span className="label-text font-semibold">withdrawalAddress</span></label>
              <p className="text-lg">{profile?.withdrawalAddress || "Not set"}</p>
            </div>
            <div>
              <label className="label"><span className="label-text font-semibold">Bio</span></label>
              <p className="text-lg whitespace-pre-wrap">{profile?.bio || "Not set"}</p>
            </div>
            <div className="flex justify-end">
              <button className="btn btn-primary" onClick={() => setEditing(true)}>Edit Profile</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
