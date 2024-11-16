<?php

namespace App\Jobs;

use App\Events\GroupDeleted;
use App\Models\Group;
use Illuminate\Foundation\Bus\Dispatchable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Queue\SerializesModels;
use Illuminate\Queue\InteractsWithQueue;

class DeleteGroupJob implements ShouldQueue
{
    use Queueable, Dispatchable, InteractsWithQueue, SerializesModels;

    /**
     * The group to delete.
     */
    public function __construct(public Group $group)
    {
        //
    }

    /**
     * Execute the job.
     */
    public function handle(): void
    {
        $id = $this->group->id;
        $name = $this->group->name;

        // Set last_message_id to null
        $this->group->last_message_id = null;
        $this->group->save();

        // Delete all associated messages
        $this->group->messages->each(function ($message) {
            $message->delete();
        });

        // Remove all users from the group
        $this->group->users()->detach();

        // Delete the group (use forceDelete if needed)
        $this->group->delete();

        // Dispatch the GroupDeleted event
        GroupDeleted::dispatch($id, $name);
    }
}
