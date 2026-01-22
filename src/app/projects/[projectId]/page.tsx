import ProjectView from '@/modules/projects/ui/views/project-view';
import { getQueryClient, trpc } from '@/trpc/server';
import { dehydrate, HydrationBoundary } from '@tanstack/react-query';
import { FC, Suspense } from 'react'

interface pageProps {
  params : Promise<{
    projectId : string;
  }>
}

const page: FC<pageProps> = async ({params} : pageProps) => {

    const {projectId} = await params;
    const queryClient = getQueryClient();
    void queryClient.prefetchQuery(trpc.messages.getMany.queryOptions({
        projectId
    }))
    void queryClient.prefetchQuery(trpc.projects.getOne.queryOptions({
        id : projectId
    }))
    
  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
        <Suspense fallback={<p>Loading...</p>}>
           <ProjectView projectId={projectId} />
      </Suspense>
    </HydrationBoundary>
  );
}

export default page