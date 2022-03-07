import { getProviderOrSigner } from "@/lib/connect-wallet/utils/web3";
import { useAppContext } from "@/src/context/AppWrapper";
import { useAuthValidation } from "@/src/hooks/useAuthValidation";
import { useErrorNotifier } from "@/src/hooks/useErrorNotifier";
import { useTxToast } from "@/src/hooks/useTxToast";
import { registry } from "@neptunemutual/sdk";
import { useWeb3React } from "@web3-react/core";
import { useCallback, useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import { useInvokeMethod } from "@/src/hooks/useInvokeMethod";

const defaultInfo = {
  totalStakeInWinningCamp: "0",
  totalStakeInLosingCamp: "0",
  myStakeInWinningCamp: "0",
  toBurn: "0",
  toReporter: "0",
  myReward: "0",
  unstaken: "0",
};

export const useUnstakeReportingStake = ({ coverKey, incidentDate }) => {
  const mountedRef = useRef(false);
  const [info, setInfo] = useState(defaultInfo);
  const { account, library } = useWeb3React();
  const { networkId } = useAppContext();

  const txToast = useTxToast();
  const { requiresAuth } = useAuthValidation();
  const { invoke } = useInvokeMethod();
  const { notifyError } = useErrorNotifier();
  const [unstaking, setUnstaking] = useState(false);

  const fetchInfo = useCallback(async () => {
    if (!networkId || !account) {
      return;
    }

    const signerOrProvider = getProviderOrSigner(library, account, networkId);
    const resolutionContract = await registry.Resolution.getInstance(
      networkId,
      signerOrProvider
    );

    const args = [account, coverKey, incidentDate];
    const [
      totalStakeInWinningCamp,
      totalStakeInLosingCamp,
      myStakeInWinningCamp,
      toBurn,
      toReporter,
      myReward,
      unstaken,
    ] = await invoke(
      resolutionContract,
      "getUnstakeInfoFor",
      {},
      notifyError,
      args,
      false
    );

    if (!mountedRef.current) {
      return;
    }

    setInfo({
      totalStakeInWinningCamp: totalStakeInWinningCamp.toString(),
      totalStakeInLosingCamp: totalStakeInLosingCamp.toString(),
      myStakeInWinningCamp: myStakeInWinningCamp.toString(),
      toBurn: toBurn.toString(),
      toReporter: toReporter.toString(),
      myReward: myReward.toString(),
      unstaken: unstaken.toString(),
    });
  }, [
    account,
    coverKey,
    incidentDate,
    invoke,
    library,
    networkId,
    notifyError,
  ]);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  useEffect(() => {
    fetchInfo().catch(console.error);
  }, [fetchInfo]);

  const unstake = async () => {
    if (!networkId || !account) {
      requiresAuth();
      return;
    }

    try {
      setUnstaking(true);
      const signerOrProvider = getProviderOrSigner(library, account, networkId);
      const resolutionContract = await registry.Resolution.getInstance(
        networkId,
        signerOrProvider
      );

      const args = [coverKey, incidentDate];
      const tx = await invoke(
        resolutionContract,
        "unstake",
        {},
        notifyError,
        args
      );

      await txToast.push(tx, {
        pending: "Unstaking NPM",
        success: "Unstaked NPM Successfully",
        failure: "Could not unstake NPM",
      });
    } catch (err) {
      notifyError(err, "Unstake NPM");
    } finally {
      setUnstaking(false);
    }
  };

  const unstakeWithClaim = async () => {
    if (!networkId || !account) {
      requiresAuth();
      return;
    }

    try {
      setUnstaking(true);
      const signerOrProvider = getProviderOrSigner(library, account, networkId);
      const resolutionContractAddress = await registry.Resolution.getAddress(
        networkId,
        signerOrProvider
      );

      let resolutionContract = new ethers.Contract(
        resolutionContractAddress,
        ["function unstakeWithClaim(bytes32, uint256)"],
        signerOrProvider
      );

      const args = [coverKey, incidentDate];
      const tx = await invoke(
        resolutionContract,
        "unstakeWithClaim",
        {},
        notifyError,
        args
      );

      await txToast.push(tx, {
        pending: "Unstaking & claiming NPM",
        success: "Unstaked & claimed NPM Successfully",
        failure: "Could not unstake & claim NPM",
      });
    } catch (err) {
      notifyError(err, "Unstake & claim NPM");
    } finally {
      setUnstaking(false);
    }
  };

  return {
    info,
    unstake,
    unstakeWithClaim,
    unstaking,
    refetch: fetchInfo,
  };
};
