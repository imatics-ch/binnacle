import { NextResponse } from 'next/server';
import Docker from 'dockerode';

export async function POST(req: Request) {
  try {
    const { id, action } = await req.json();
    if (!id || !action) {
      return NextResponse.json({ error: 'Missing container id or action' }, { status: 400 });
    }

    if (process.env.DEMO_MODE === 'true') {
      // Simulate fake latency delay to make UI look organic and responsive
      await new Promise((resolve) => setTimeout(resolve, 800));
      return NextResponse.json({ success: true, message: `Demo mode intercepted ${action} action.` });
    }

    const dockerOptions = process.env.DOCKER_SOCKET_PATH ? { socketPath: process.env.DOCKER_SOCKET_PATH } : {};
    const docker = new Docker(dockerOptions);

    const container = docker.getContainer(id);

    // Validate action
    if (action === 'start') {
      await container.start();
    } else if (action === 'stop') {
      await container.stop();
    } else if (action === 'restart') {
      await container.restart();
    } else {
      return NextResponse.json({ error: 'Invalid action. Must be start, stop, or restart' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Container ${action} successful` });
  } catch (error: any) {
    console.error('Docker action error:', error);
    return NextResponse.json({ error: error.message || 'Action failed' }, { status: 500 });
  }
}
