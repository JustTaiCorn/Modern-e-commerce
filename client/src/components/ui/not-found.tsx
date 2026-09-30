'use client';

import { Button } from '@/components/ui/button';
import {
  Item,
  ItemActions,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
} from '@/components/ui/item';
import { cn } from '@/utils/cn';
import { ArrowLeftIcon, HomeIcon } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export function NotFound() {
  const router = useRouter();

  return (
    <Item
      variant={'muted'}
      className='border-border mx-auto max-w-6xl justify-center gap-12 py-8 shadow'
    >
      <ItemContent className={cn('flex-none gap-5')}>
        <ItemTitle className='text-4xl font-semibold'>
          We looked everywhere.
        </ItemTitle>
        <ItemDescription className='text-foreground w-fit text-lg'>
          Looks like this page is missing. <br />
          If you still need help, visit our{' '}
          <Link href={'/helps'} className='font-medium'>
            help pages
          </Link>
          .
        </ItemDescription>
        <ItemActions className='gap-4'>
          <Button asChild size={'lg'} className='flex-1'>
            <Link href={`/`}>
              <HomeIcon />
              <span>Go to homepage</span>
            </Link>
          </Button>
          <Button
            size={'lg'}
            variant={'outline'}
            className='bg-muted hover:border-primary hover:text-primary flex-1'
            onClick={() => router.back()}
          >
            <ArrowLeftIcon />
            <span>Go back</span>
          </Button>
        </ItemActions>
      </ItemContent>
      <ItemMedia className='my-auto flex-none'>
        <img
          src='/not-found.png'
          alt='page not found'
          className='h-96 object-contain'
        />
      </ItemMedia>
    </Item>
  );
}
