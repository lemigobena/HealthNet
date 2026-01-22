// Simplified version of shadcn/ui toast for compatibility
import { useState, useEffect } from "react"

const listeners = []
let memoryState = { toasts: [] }

function dispatch(action) {
    memoryState = reducer(memoryState, action)
    listeners.forEach((listener) => {
        listener(memoryState)
    })
}

function reducer(state, action) {
    switch (action.type) {
        case "ADD_TOAST":
            return {
                ...state,
                toasts: [action.toast, ...state.toasts].slice(0, 1), // Limit to 1 for simplicity
            }
        case "DISMISS_TOAST":
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            }
        case "REMOVE_TOAST":
            return {
                ...state,
                toasts: state.toasts.filter((t) => t.id !== action.toastId),
            }
        default:
            return state
    }
}

let count = 0

function genId() {
    count = (count + 1) % Number.MAX_SAFE_INTEGER
    return count.toString()
}

function toast({ ...props }) {
    const id = genId()

    const update = (props) =>
        dispatch({
            type: "UPDATE_TOAST",
            toast: { ...props, id },
        })

    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open) => {
                if (!open) dismiss()
            },
        },
    })

    return {
        id: id,
        dismiss,
        update,
    }
}

function useToast() {
    const [state, setState] = useState(memoryState)

    useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast,
        dismiss: (toastId) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
}

export { useToast, toast }
