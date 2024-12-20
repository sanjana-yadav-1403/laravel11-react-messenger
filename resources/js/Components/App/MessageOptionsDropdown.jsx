import { EllipsisVerticalIcon, TrashIcon } from "@heroicons/react/24/solid";
import axios from "axios";
import { Fragment, useCallback, useEffect } from "react";
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from "@headlessui/react";
import { useEventBus } from "@/EventBus";

export default function MessageOptionsDropdown({ message }) {
    const { emit } = useEventBus();

    const onMessageDelete = useCallback(() => {
        console.log("Delete Message");
        axios
            .delete(route("message.destroy", message.id))
            .then((res) => {
                // Only emit if the response message is different to prevent repeated emissions
                if (res.data.message !== message) {
                    emit("message.deleted", { message, prevMessage: res.data.message });
                }
            })
            .catch((err) => {
                console.error(err);
            });
    }, [message, emit]);

    useEffect(() => {
        // This useEffect prevents any initial emission to avoid an immediate re-render loop
        if (message) {
            console.log("Message ready for deletion", message);
        }
    }, [message]);

    return (
        <div className="absolute right-full text-gray-100 top-1/2 -translate-y-1/2 z-10">
            <Menu as={Fragment}>
                <div className="relative inline-block text-left">
                    <MenuButton className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-black/40">
                        <EllipsisVerticalIcon className="h-5 w-5" />
                    </MenuButton>
                    <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                    >
                        <MenuItems className="absolute left-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg z-50">
                            <div className="px-1 py-1">
                                <MenuItem>
                                    {({ selected }) => (
                                        <button
                                            onClick={onMessageDelete}
                                            className={`${
                                                selected
                                                    ? "bg-black/30 text-white"
                                                    : "text-gray-100"
                                            } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                        >
                                            <TrashIcon className="w-4 h-4 mr-2" />
                                            Delete
                                        </button>
                                    )}
                                </MenuItem>
                            </div>
                        </MenuItems>
                    </Transition>
                </div>
            </Menu>
        </div>
    );
}
