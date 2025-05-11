
"use client";

import { useState, useEffect, useRef, type ChangeEvent } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Edit3, Save, Loader2, Mail, Info, UploadCloud, KeyRound, LockKeyhole } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

// Define Zod schema for profile form validation
const profileSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters." }).max(50),
  email: z.string().email({ message: "Invalid email address." }),
  bio: z.string().max(200, { message: "Bio cannot exceed 200 characters." }).optional().default(""),
  avatarUrl: z.string().url({ message: "Invalid URL for avatar." }).optional().nullable(),
  currentPassword: z.string().optional().default(""),
  newPassword: z.string().optional().default(""),
  confirmNewPassword: z.string().optional().default(""),
}).superRefine((data, ctx) => {
  // If any password field is filled, enforce rules for all password fields
  if (data.newPassword || data.currentPassword || data.confirmNewPassword) {
    if (!data.currentPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Current password is required to change password.", path: ["currentPassword"] });
    }
    if (!data.newPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "New password is required.", path: ["newPassword"] });
    } else if (data.newPassword.length < 8) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "New password must be at least 8 characters.", path: ["newPassword"] });
    }
    if (!data.confirmNewPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Please confirm your new password.", path: ["confirmNewPassword"] });
    } else if (data.newPassword && data.newPassword !== data.confirmNewPassword) {
      ctx.addIssue({ code: z.ZodIssueCode.custom, message: "New passwords do not match.", path: ["confirmNewPassword"] });
    }
    // Mock current password check (in a real app, this is backend logic)
    if (data.currentPassword && data.currentPassword !== "password123" && data.newPassword) {
        ctx.addIssue({ code: z.ZodIssueCode.custom, message: "Incorrect current password (Hint: 'password123').", path: ["currentPassword"] });
    }
  }
});

type ProfileFormData = z.infer<typeof profileSchema>;

interface UserDataState {
  name: string;
  email: string;
  bio?: string;
  avatarUrl?: string | null;
}

// Mock user data - in a real app, this would come from an API or auth context
const mockUser: UserDataState = {
  name: "Demo User",
  email: "user@example.com",
  bio: "Loves recycling and saving the planet!",
  avatarUrl: "https://picsum.photos/id/237/100/100",
};

export default function ProfilePage() {
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userData, setUserData] = useState<UserDataState>(mockUser);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: { ...userData, currentPassword: '', newPassword: '', confirmNewPassword: '' },
  });

  const watchedAvatarUrl = watch("avatarUrl");

  useEffect(() => {
    // Reset form with current userData when it changes (e.g. after save)
    // and ensure password fields are cleared
    reset({ ...userData, currentPassword: '', newPassword: '', confirmNewPassword: '' });
  }, [userData, reset]);

  const onSubmit: SubmitHandler<ProfileFormData> = async (formData) => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const { currentPassword, newPassword, confirmNewPassword, ...profileInfoToUpdate } = formData;

    let profileUpdated = false;
    let passwordEffectivelyChanged = false;

    // Check if profile info actually changed
    if (profileInfoToUpdate.name !== userData.name ||
        profileInfoToUpdate.email !== userData.email ||
        (profileInfoToUpdate.bio || "") !== (userData.bio || "") || // Handle undefined bio
        profileInfoToUpdate.avatarUrl !== userData.avatarUrl) {
      setUserData(profileInfoToUpdate);
      profileUpdated = true;
    }
    
    // Check if password change was intended and valid
    // For demo: password is "changed" if validly entered, but not actually stored/used for next login.
    // Real app: Call backend to verify currentPassword and save new hashed password.
    if (newPassword && currentPassword && newPassword === confirmNewPassword && currentPassword === "password123") {
        passwordEffectivelyChanged = true;
    } else if (newPassword && currentPassword && newPassword === confirmNewPassword && currentPassword !== "password123") {
        // This case is for when Zod check for "password123" passes (meaning currentPassword was NOT "password123")
        // but we still need to inform user if other conditions for password change were met.
        // Zod validation should ideally catch this.
    }


    setIsEditing(false);
    setIsLoading(false);

    if (profileUpdated && passwordEffectivelyChanged) {
      toast({
        title: "Profile & Password Updated",
        description: "Your information and password have been saved.",
      });
    } else if (profileUpdated) {
      toast({
        title: "Profile Updated",
        description: "Your profile information has been saved.",
      });
    } else if (passwordEffectivelyChanged) {
      toast({
        title: "Password Changed",
        description: "Your password has been updated. (For demo, 'password123' is still the master password).",
      });
    } else if (!profileUpdated && !passwordEffectivelyChanged && (newPassword || currentPassword || confirmNewPassword)) {
      toast({
        title: "No Changes Applied",
        description: "Ensure all password fields are correctly filled if changing password, or clear them if not.",
        variant: "default"
      });
    } else {
        toast({
            title: "No Changes Detected",
            description: "Your information remains the same.",
            variant: "default"
        });
    }
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Reset form to original userData if canceling edit, clearing password fields
      reset({ ...userData, currentPassword: '', newPassword: '', confirmNewPassword: '' });
    } else {
      // When starting to edit, ensure password fields are also reset (empty)
      reset({ ...userData, currentPassword: '', newPassword: '', confirmNewPassword: '' });
    }
    setIsEditing(!isEditing);
  };

  const handleAvatarChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) { // Max 2MB
        toast({
          title: "Image Too Large",
          description: "Please select an image smaller than 2MB.",
          variant: "destructive",
        });
        if(fileInputRef.current) fileInputRef.current.value = ""; // Clear the input
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUri = reader.result as string;
        setValue('avatarUrl', dataUri, { shouldValidate: true });
      };
      reader.readAsDataURL(file);
    }
  };
  
  const currentAvatarDisplayUrl = () => {
    // For display, prioritize watchedAvatarUrl if it's a data URI (newly uploaded)
    if (watchedAvatarUrl && watchedAvatarUrl.startsWith('data:image/')) {
      return watchedAvatarUrl;
    }
    // Otherwise, use the URL from userData (either original or after a save)
    return userData.avatarUrl || `https://picsum.photos/seed/${userData.email || 'default'}/100/100`;
  };


  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground flex items-center">
            <UserCircle className="mr-3 h-8 w-8 text-primary" />
            My Profile
          </h1>
          <p className="text-muted-foreground">View and manage your account details. Click 'Edit Profile' to update your information or change your password.</p>
        </div>
        <Button onClick={handleEditToggle} variant={isEditing ? "outline" : "default"} className="w-full sm:w-auto">
          {isEditing ? (
            <>Cancel</>
          ) : (
            <><Edit3 className="mr-2 h-4 w-4" /> Edit Profile</>
          )}
        </Button>
      </div>

      <Card className="shadow-lg">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader>
            <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
              <Avatar className="h-24 w-24 border-2 border-primary text-3xl">
                <AvatarImage 
                  src={currentAvatarDisplayUrl()} 
                  alt={userData.name} 
                  data-ai-hint="profile picture" 
                />
                <AvatarFallback>
                  {userData.name ? userData.name.substring(0, 2).toUpperCase() : "SC"}
                </AvatarFallback>
              </Avatar>
              <div className="text-center sm:text-left">
                <CardTitle className="text-2xl">{isEditing ? "Editing Profile" : userData.name}</CardTitle>
                <CardDescription>{isEditing ? "Update your personal information below." : userData.email}</CardDescription>
                {isEditing && (
                  <div className="mt-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isLoading}
                    >
                      <UploadCloud className="mr-2 h-4 w-4" /> Change Avatar
                    </Button>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/gif, image/webp"
                      className="hidden"
                      ref={fileInputRef}
                      onChange={handleAvatarChange}
                      disabled={!isEditing || isLoading}
                    />
                    {errors.avatarUrl && <p className="text-sm text-destructive mt-1">{errors.avatarUrl.message}</p>}
                  </div>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6 pt-6">
            {/* Profile Information */}
            <div>
              <Label htmlFor="name" className="flex items-center mb-1">
                <UserCircle className="mr-2 h-4 w-4 text-muted-foreground" /> Full Name
              </Label>
              <Input
                id="name"
                {...register("name")}
                disabled={!isEditing || isLoading}
                className={cn(errors.name && "border-destructive")}
              />
              {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <Label htmlFor="email" className="flex items-center mb-1">
                <Mail className="mr-2 h-4 w-4 text-muted-foreground" /> Email Address
              </Label>
              <Input
                id="email"
                type="email"
                {...register("email")}
                disabled={!isEditing || isLoading} 
                className={cn(errors.email && "border-destructive")}
              />
              {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
            </div>
            
            <input type="hidden" {...register("avatarUrl")} />

            <div>
              <Label htmlFor="bio" className="flex items-center mb-1">
                <Info className="mr-2 h-4 w-4 text-muted-foreground" /> Bio (Optional)
              </Label>
              <Textarea
                id="bio"
                {...register("bio")}
                placeholder="Tell us a little about yourself..."
                rows={3}
                disabled={!isEditing || isLoading}
                className={cn(errors.bio && "border-destructive")}
              />
              {errors.bio && <p className="text-sm text-destructive mt-1">{errors.bio.message}</p>}
            </div>

            {/* Password Change Section - Only visible when editing */}
            {isEditing && (
              <>
                <Separator className="my-6" />
                <div className="space-y-4">
                  <h3 className="text-lg font-medium flex items-center text-foreground">
                    <LockKeyhole className="mr-2 h-5 w-5 text-primary" /> Change Password
                  </h3>
                  <div>
                    <Label htmlFor="currentPassword" className="flex items-center mb-1">
                      <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" /> Current Password
                    </Label>
                    <Input
                      id="currentPassword"
                      type="password"
                      {...register("currentPassword")}
                      placeholder="Enter your current password"
                      disabled={isLoading}
                      className={cn(errors.currentPassword && "border-destructive")}
                    />
                    {errors.currentPassword && <p className="text-sm text-destructive mt-1">{errors.currentPassword.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className="flex items-center mb-1">
                      <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" /> New Password
                    </Label>
                    <Input
                      id="newPassword"
                      type="password"
                      {...register("newPassword")}
                      placeholder="Enter new password (min. 8 characters)"
                      disabled={isLoading}
                      className={cn(errors.newPassword && "border-destructive")}
                    />
                    {errors.newPassword && <p className="text-sm text-destructive mt-1">{errors.newPassword.message}</p>}
                  </div>
                  <div>
                    <Label htmlFor="confirmNewPassword" className="flex items-center mb-1">
                      <KeyRound className="mr-2 h-4 w-4 text-muted-foreground" /> Confirm New Password
                    </Label>
                    <Input
                      id="confirmNewPassword"
                      type="password"
                      {...register("confirmNewPassword")}
                      placeholder="Confirm your new password"
                      disabled={isLoading}
                      className={cn(errors.confirmNewPassword && "border-destructive")}
                    />
                    {errors.confirmNewPassword && <p className="text-sm text-destructive mt-1">{errors.confirmNewPassword.message}</p>}
                  </div>
                </div>
              </>
            )}
          </CardContent>
          {isEditing && (
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Save Changes
              </Button>
            </CardFooter>
          )}
        </form>
      </Card>
    </div>
  );
}
