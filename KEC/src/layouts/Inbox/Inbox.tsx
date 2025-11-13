import InboxLayout from './InboxLayout';
import { ChatProvider } from './ChatContext';

const Inbox = () => {
  return (
    <ChatProvider>
      <InboxLayout />
    </ChatProvider>
  );
};

export default Inbox;
