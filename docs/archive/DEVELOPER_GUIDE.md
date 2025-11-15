# MH26 Services - Developer Guide

## Quick Start

### Installation
```bash
npm install
```

### Development
```bash
npm run dev
```

### Seed Mock Data
```bash
npm run dev:seed
```

## Using API Hooks

### Authentication

```tsx
import { useLogin, useRegister, useLogout } from '@/api/auth';

function LoginForm() {
  const login = useLogin();
  
  const handleSubmit = (data) => {
    login.mutate({
      email: data.email,
      password: data.password,
      userType: 'CUSTOMER', // or 'PROVIDER', 'ADMIN'
    });
  };
  
  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={login.isPending}>
        {login.isPending ? 'Signing in...' : 'Sign In'}
      </button>
    </form>
  );
}
```

### Providers

```tsx
import { useProviders, useProvider } from '@/api/providers';

function ProviderList() {
  const { data, isLoading, error } = useProviders({
    category: 'plumbing',
    city: 'Nanded',
    page: 1,
    limit: 10,
  });
  
  if (isLoading) return <Loading />;
  if (error) return <Error />;
  
  return (
    <div>
      {data?.data.map(provider => (
        <ProviderCard key={provider.id} provider={provider} />
      ))}
    </div>
  );
}
```

### Bookings

```tsx
import { useBookings, useCreateBooking, useExportBookingsCSV } from '@/api/bookings';

function BookingsPage() {
  const { data } = useBookings({ status: 'CONFIRMED' });
  const createBooking = useCreateBooking();
  const exportCSV = useExportBookingsCSV();
  
  const handleCreate = () => {
    createBooking.mutate({
      providerId: 'p1',
      serviceId: 's1',
      scheduledAt: '2024-11-15T10:00:00Z',
      address: '123 Main St',
      price: 1500,
    });
  };
  
  return (
    <div>
      <button onClick={() => exportCSV.mutate()}>
        Export CSV
      </button>
      {/* bookings list */}
    </div>
  );
}
```

### Messages

```tsx
import { useConversations, useMessages, useSendMessage } from '@/api/messages';

function MessageCenter() {
  const { data: conversations } = useConversations();
  const sendMessage = useSendMessage();
  
  const handleSend = (conversationId: string, content: string) => {
    sendMessage.mutate({
      conversationId,
      content,
    });
  };
  
  return (
    <div>
      {conversations?.map(conv => (
        <ConversationItem key={conv.id} conversation={conv} />
      ))}
    </div>
  );
}
```

### Admin

```tsx
import { 
  useAdminProviders, 
  useUpdateProviderStatus,
  useServiceTypes,
  useCreateServiceType 
} from '@/api/admin';

function AdminPanel() {
  const { data: providers } = useAdminProviders({ status: 'PENDING' });
  const updateStatus = useUpdateProviderStatus();
  const { data: services } = useServiceTypes();
  const createService = useCreateServiceType();
  
  const handleApprove = (providerId: string) => {
    updateStatus.mutate({
      id: providerId,
      status: 'VERIFIED',
      notes: 'All documents verified',
    });
  };
  
  return (
    <div>
      {/* admin UI */}
    </div>
  );
}
```

## Form Validation with Zod

```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '@/lib/validations/auth';

function LoginForm() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
  });
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
      
      <input {...register('password')} type="password" />
      {errors.password && <span>{errors.password.message}</span>}
    </form>
  );
}
```

## Invoice PDF Generation

```tsx
import { InvoiceDownloadButton } from '@/components/InvoicePDF';

function InvoicePage({ invoice }) {
  return (
    <div>
      <InvoiceDownloadButton invoice={invoice} />
    </div>
  );
}
```

## Socket Integration

```tsx
import { getSocket } from '@/lib/socket';
import { useEffect } from 'react';

function MessageComponent() {
  useEffect(() => {
    const socket = getSocket();
    socket.connect();
    
    socket.on('message:new', (message) => {
      // Handle new message
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);
}
```

## Environment Variables

Create `.env` file:
```
VITE_API_BASE_URL=http://localhost:3000/api
VITE_SOCKET_URL=http://localhost:3001
```

## TypeScript Types

All API responses are fully typed. Import types from API files:

```tsx
import type { Provider, Booking, Message } from '@/api/providers';
```

## Error Handling

All hooks handle errors automatically and show toast notifications. For custom handling:

```tsx
const login = useLogin();

login.mutate(data, {
  onError: (error) => {
    // Custom error handling
    console.error(error);
  },
});
```

## Mock vs Real API

The API clients are ready for backend integration. To switch from mock to real:

1. Update `VITE_API_BASE_URL` in `.env`
2. Ensure backend endpoints match the expected structure
3. All React Query hooks will work seamlessly

## Best Practices

1. **Always use React Query hooks** for data fetching
2. **Use Zod schemas** for form validation
3. **Handle loading states** with `isLoading` or `isPending`
4. **Use optimistic updates** for better UX (see messages example)
5. **Clear cache** when needed: `queryClient.invalidateQueries(['key'])`

