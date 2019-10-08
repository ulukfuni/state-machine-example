import { assign } from 'xstate'

const emailStates = {
  initial: "noError",
  states: {
    noError: {},
    error: {
      initial: "empty",
      states: {
        empty: {},
        badFormat: {},
        noAccount: {}
      },
      onEntry: "focusEmailInput"
    }
  }
}

const passwordStates = {
  initial: "noError",
  states: {
    noError: {},
    error: {
      initial: "empty",
      states: {
        empty: {},
        tooShort: {},
        incorrect: {}
      },
      onEntry: "focusPasswordInput"
    }
  }
}

const authServiceStates = {
  initial: "noError",
  states: {
    noError: {},
    error: {
      initial: "communication",
      states: {
        communication: {
          on: {
            SUBMIT: "#signInForm.waitingResponse"
          }
        },
        internal: {}
      }
    }
  }
}

export const loginMachineConfig = {
  id: "signInForm",
  context: {
    email: "",
    password: ""
  },
  initial: "ready",
  states: {
    ready: {
      type: "parallel",
      on: {
        INPUT_EMAIL: {
          actions: "cacheEmail",
          target: "ready.email.noError"
        },
        INPUT_PASSWORD: {
          actions: "cachePassword",
          target: "ready.password.noError"
        },
        SUBMIT: [
          {
            cond: "isNoEmail",
            target: "ready.email.error.empty"
          },
          // {
          //   cond: "isEmailBadFormat",
          //   target: "ready.email.error.badFormat"
          // },
          {
            cond: "isNoPassword",
            target: "ready.password.error.empty"
          },
          {
            cond: "isPasswordShort",
            target: "ready.password.error.tooShort"
          },
          {
            target: "waitingResponse"
          }
        ]
      },
      states: {
        email: {
          ...emailStates
        },
        password: {
          ...passwordStates
        },
        authService: {
          ...authServiceStates
        }
      }
    },
    waitingResponse: {
      on: {
        CANCEL: "ready"
      },
      invoke: {
        src: "requestSignIn",
        onDone: {
          actions: "onSuccess"
        },
        onError: [
          {
            cond: "isNoAccount",
            target: "ready.email.error.noAccount"
          },
          {
            cond: "isIncorrectPassword",
            target: "ready.password.error.incorrect"
          },
          {
            cond: "isNoResponse",
            target: "ready.authService.error.communication"
          },
          {
            cond: "isInternalServerErr",
            target: "ready.authService.error.internal"
          }
        ]
      }
    }
  }
};

// export const loginMachineConfig = {
//   // machine identity
//   id: 'login',
//   // local context (extended state) for entire machine
//   context: {
//     email: '',
//     password: ''
//   },
//   initial: 'ready',
//   states: {
//     ready: {
//       // child states can be done in parallel if type set to parallel
//       type: 'parallel',
//       on: {
//         INPUT_EMAIL: {
//           // target denotes what state it is transistioning to next
//           target: '',
//           action: ''
//         }
//       },
//       states: {}
//     }
//   }
// }

export const options = {
  // mapping of transition guard (cond) names to implementation
  // a func that takes 2 args
  guards: {
    isNoEmail: (ctx, evt) => ctx.email.length === 0,
    isEmailBadFormat: (ctx, evt) => ctx.email.length > 0 && !ctx.email.includes('@'),
    // isEmailBadFormat: (context, event) =>
    //   context.email.length > 0 && !isEmail(context.email),
    isNoPassword: (context, event) => context.password.length === 0,
    isPasswordShort: (context, event) => context.password.length < 5,
    isNoAccount: (context, evt) => evt.data.code === 1,
    isIncorrectPassword: (context, evt) => evt.data.code === 2,
    isNoResponse: (context, evt) => evt.data.code === 3,
    isInternalServerErr: (context, evt) => evt.data.code === 4
  },
  // mapping of invoked service (src) names to implementation
  services: {
    requestSignIn: (context, event) => signIn(context.email, context.password)
  },
  // mapping of action names to implementation
  actions: {
    // assign is like setState for your context
    cacheEmail: assign((ctx, evt) => ({
      email: evt.email
    })),
    cachePassword: assign((ctx, evt) => ({
      password: evt.password
    })),
    onSuccess: () => console.log('signed in')
  },
  // mapping of activity names to implementation
  activities: {}
}

// error code 1 - no account
// error code 2 - wrong password
// error code 3 - no response
// error code 4 - internal server error

const isNoResponse = () => Math.random() >= 0.75;

export const signIn = (email, password) =>
  new Promise((resolve, reject) => {
    setTimeout(() => {
      if (email !== "admin@admin.com") {
        reject({ code: 1 });
      }

      if (password !== "admin") {
        reject({ code: 2 });
      }

      if (isNoResponse()) {
        reject({ code: 3 });
      }

      resolve();
    }, 1500);
  });