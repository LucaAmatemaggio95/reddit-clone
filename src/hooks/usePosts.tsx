import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  where,
  writeBatch
} from "firebase/firestore";
import { deleteObject, ref } from "firebase/storage";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { useRecoilState, useRecoilValue, useSetRecoilState } from "recoil";
import { authModalState } from "../atoms/authModalAtom";
import { communityState } from "../atoms/communitiesAtom";
import { Post, postState, PostVote } from "../atoms/postAtom";
import { auth, firestore, storage } from "../firebase/clientApp";

const usePosts = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [postStateValue, setPostStateValue] = useRecoilState(postState);
  const currentCommunity = useRecoilValue(communityState).currentCommunity;
  const setAuthModalState = useSetRecoilState(authModalState);

  const onVote = async (
    event: React.MouseEvent<SVGElement>,
    post: Post,
    vote: number,
    communityId: string
  ) => {
    event.stopPropagation();
    // check for a user => if not open the auth modal
    if (!user?.uid) {
      setAuthModalState({ open: true, view: "login" });
      return;
    }

    try {
      const { voteStatus } = post;
      const existingVote = postStateValue.postVotes.find(
        vote => vote.postId === post.id
      );

      const batch = writeBatch(firestore);
      const updatePost = { ...post };
      const updatedPosts = [...postStateValue.posts];
      let updatedPostVotes = [...postStateValue.postVotes];
      let voteChange = vote;

      // if this is a new vote
      if (!existingVote) {
        // create a new postVote document
        const postVoteRef = doc(
          collection(firestore, "users", `${user?.uid}/postVotes`)
        );

        const newVote: PostVote = {
          id: postVoteRef.id,
          postId: post.id!,
          communityId,
          voteValue: vote // 1 or -1
        };

        batch.set(postVoteRef, newVote);

        // add or subtract 1 to the post.voteStatus
        updatePost.voteStatus = voteStatus + vote;
        updatedPostVotes = [...updatedPostVotes, newVote];
      }
      // existing vote - user ha voted in the past before
      else {
        const postVoteRef = doc(
          firestore,
          "users",
          `${user?.uid}/postVotes/${existingVote.id}`
        );

        // remove previous vote
        if (existingVote.voteValue === vote) {
          // add or subtract 1 to the post.voteStatus
          updatePost.voteStatus = voteStatus - vote;

          updatedPostVotes = updatedPostVotes.filter(
            vote => vote.id !== existingVote.id
          );
          // delete the postvote document
          batch.delete(postVoteRef);
          voteChange *= -1;
        }

        // flip the vote
        else {
          // add or subtract 2 to the post.voteStatus
          updatePost.voteStatus = voteStatus + 2 * vote;

          const voteIndex = postStateValue.postVotes.findIndex(
            vote => vote.id === existingVote.id
          );

          updatedPostVotes[voteIndex] = {
            ...existingVote,
            voteValue: vote
          };

          // update the existing postvote document
          batch.update(postVoteRef, {
            voteValue: vote
          });

          voteChange = 2 * vote;
        }
      }

      // update the recoil state
      const postIndex = postStateValue.posts.findIndex(
        item => item.id === post.id
      );
      updatedPosts[postIndex] = updatePost;

      setPostStateValue(prev => ({
        ...prev,
        posts: updatedPosts,
        postVotes: updatedPostVotes
      }));

      if (postStateValue.selectedPost) {
        setPostStateValue(prev => ({
          ...prev,
          selectedPost: updatePost
        }));
      }

      // update state with updated values
      const postRef = doc(firestore, "posts", post.id!);
      batch.update(postRef, { voteStatus: voteStatus + voteChange });

      // write updates to the db
      await batch.commit();
    } catch (error) {
      console.log("onVote error", error);
    }
  };

  const onSelectPost = (post: Post) => {
    setPostStateValue(prev => ({
      ...prev,
      selectedPost: post
    }));
    router.push(`/r/${post.communityId}/comments/${post.id}`);
  };

  const onDeletPost = async (post: Post): Promise<boolean> => {
    try {
      // check if the post have an image attached and delete it
      if (post.imageURL) {
        const imageRef = ref(storage, `posts/${post.id}/image`);
        await deleteObject(imageRef);
      }

      // delete post from db
      const postDocRef = doc(firestore, "posts", post.id!);
      await deleteDoc(postDocRef);

      // update recoil state
      setPostStateValue(prev => ({
        ...prev,
        posts: prev.posts.filter(item => item.id !== post.id)
      }));

      return true;
    } catch (error) {
      return false;
    }
  };

  // fetch all the votes for this community
  const getCommunityPostVotes = async (communityId: string) => {
    const postVotesQuery = query(
      collection(firestore, "users", `${user?.uid}/postVotes`),
      where("communityId", "==", communityId)
    );

    const postVoteDocs = await getDocs(postVotesQuery);

    const postVotes = postVoteDocs.docs.map(doc => ({
      id: doc,
      ...doc.data()
    }));

    setPostStateValue(prev => ({
      ...prev,
      postVotes: postVotes as unknown as PostVote[]
    }));
  };

  useEffect(() => {
    if (!user || !currentCommunity?.id) return;
    getCommunityPostVotes(currentCommunity?.id);
  }, [user, currentCommunity]);

  useEffect(() => {
    // if the user is not logged in clear the post votes value
    if (!user) {
      setPostStateValue(prev => ({
        ...prev,
        postVotes: []
      }));
    }
  }, [user]);

  return {
    postStateValue,
    setPostStateValue,
    onVote,
    onSelectPost,
    onDeletPost
  };
};
export default usePosts;
