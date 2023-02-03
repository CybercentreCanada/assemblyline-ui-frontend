// react-router-dom v6 removed useBlocker() due to edge case downsides
// https://github.com/remix-run/react-router/releases/tag/v6.0.0-beta.7
// more deets about why: https://github.com/remix-run/history/issues/690
// this restores that feature since we don't care about the edge cases

import type { Blocker, History, Transition } from 'history';
import { ContextType, useContext, useEffect, useRef } from 'react';
import { Navigator as BaseNavigator, UNSAFE_NavigationContext as NavigationContext } from 'react-router-dom';

interface Navigator extends BaseNavigator {
  block: History['block'];
}

type NavigationContextWithBlock = ContextType<typeof NavigationContext> & { navigator: Navigator };

// rmorse gist: https://gist.github.com/rmorse/426ffcc579922a82749934826fa9f743
// lower level history library example, helpful for seeing use of confirmation flow inside useBlocker:https://github.com/remix-run/history/blob/main/docs/blocking-transitions.md

// approach below copied and tweaked from github issue:
// https://github.com/remix-run/react-router/issues/8139#issuecomment-1023105785
export function useBlocker(blocker: Blocker, when = true) {
  const { navigator } = useContext(NavigationContext) as NavigationContextWithBlock;

  //main tweak required to OP was wrapping unblock in ref so we're only pushing one blocker on the stack for this when expression (i.e. not for every render)
  const refUnBlock = useRef<() => void>();

  useEffect(() => {
    if (!when) {
      refUnBlock.current?.();
      return;
    }

    if (!refUnBlock.current && navigator.block)
      refUnBlock.current = navigator.block((tx: Transition) => {
        const autoUnblockingTx = {
          ...tx,
          retry() {
            refUnBlock.current?.(); //need to unblock so retry succeeds
            tx.retry();
          }
        };

        blocker(autoUnblockingTx);
      });
  }, [navigator, blocker, when]);
}
