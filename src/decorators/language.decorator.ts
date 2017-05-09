import { ChangeDetectorRef } from '@angular/core';
import { ISubscription } from 'rxjs/Subscription';

import { TranslationService } from '../services/translation.service';
import { InjectorRef } from '../models/injector-ref';
import { PropertyDecorator } from '../models/types';

/**
 * Property decorator for components to provide the parameter to the translate pipe.
 */
export function Language(): PropertyDecorator {

    return (target: any, propertyKey?: string): void => {
        const targetNgOnInit: Function = target.ngOnInit;
        const targetNgOnDestroy: Function = target.ngOnDestroy;

        let subscription: ISubscription;

        target.ngOnInit = function (): void {
            const translation: TranslationService = InjectorRef.get(TranslationService);
            const changeDetectorRef: ChangeDetectorRef = InjectorRef.get(ChangeDetectorRef);

            if (typeof propertyKey !== "undefined") {
                this[propertyKey] = translation.getLanguage();
                // When the language changes, subscribes to the event & updates language property.
                subscription = translation.translationChanged.subscribe(
                    (value: string) => {
                        this[propertyKey] = value;
                        // OnPush Change Detection strategy.
                        if (changeDetectorRef) { changeDetectorRef.markForCheck(); }
                    });
            }

            if (targetNgOnInit) {
                targetNgOnInit.apply(this);
            }
        };

        target.ngOnDestroy = function (): void {
            if (typeof subscription !== "undefined") {
                subscription.unsubscribe();
            }

            if (targetNgOnDestroy) {
                targetNgOnDestroy.apply(this);
            }
        };

        if (typeof propertyKey !== "undefined") {
            Object.defineProperty(target, propertyKey, {
                writable: true,
                value: undefined
            });
        }
    };

}